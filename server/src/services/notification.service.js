import { Notification } from "../models/notifications.model.js";
import { PushSubscription } from "../models/pushSubscription.model.js";
import { getIO, normalizeUserId } from "./socket.service.js";
import { webpush, vapidPublicKey } from "./webpush.service.js";

/**
 * Central Notification Service
 * 
 * All notification creation flows through this single service.
 * Responsibilities:
 *   1. Create MongoDB notification record
 *   2. Emit Socket.IO real-time event to user-specific room
 *   3. Send Web Push notification to all user devices (non-blocking)
 *   4. Clean up invalid/expired push subscriptions
 * 
 * Notification failure NEVER causes the calling operation to fail.
 */

/**
 * Create and deliver a notification.
 * 
 * @param {Object} params
 * @param {string|Object} params.recipientId - User ID of the recipient
 * @param {string} params.type - Notification type enum value
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body text
 * @param {string} [params.complaintId] - Related complaint ID
 * @param {string} [params.actorId] - User who triggered the notification
 * @param {Object} [params.metadata] - Additional metadata
 * @returns {Promise<Object|null>} Created notification or null on error
 */
export async function createNotification({
  recipientId,
  type,
  title,
  message,
  complaintId = null,
  actorId = null,
  metadata = {}
}) {
  try {
    if (!recipientId || !title || !message) {
      console.warn("[NotificationService] Missing required fields, skipping notification");
      return null;
    }

    const recipientIdStr = normalizeUserId(recipientId);
    console.log(`Creating notification for user: ${recipientIdStr}`);

    // 1. Create MongoDB notification
    const notification = await Notification.create({
      recipient: recipientIdStr,
      type: type || "SYSTEM",
      title,
      message,
      complaint: complaintId || null,
      actor: actorId || null,
      metadata
    });

    console.log(`Notification created: ${notification._id}`);

    // Populate complaint for the emitted payload
    const populated = await Notification.findById(notification._id)
      .populate("complaint", "complaintNumber title status");

    // 2. Emit via Socket.IO (real-time in-app)
    emitSocketNotification(recipientIdStr, populated);

    // 3. Send Web Push (phone/browser push) — non-blocking
    sendPushNotification(recipientIdStr, {
      title,
      body: message,
      type,
      notificationId: notification._id.toString(),
      complaintId: complaintId?.toString() || null,
      url: buildNotificationUrl(type, complaintId)
    }).catch((err) => {
      console.warn("[NotificationService] Push delivery error (non-fatal):", err.message);
    });

    return populated;
  } catch (error) {
    console.error("[NotificationService] Failed to create notification:", error.message);
    return null;
  }
}

/**
 * Create notifications for multiple recipients.
 * Uses Promise.allSettled to ensure one failure doesn't block others.
 * 
 * @param {Array<Object>} notifications - Array of notification params
 * @returns {Promise<Array>} Array of created notifications
 */
export async function createBulkNotifications(notifications) {
  const results = await Promise.allSettled(
    notifications.map((params) => createNotification(params))
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value);
}

/**
 * Emit a notification via Socket.IO to the user's private room.
 */
function emitSocketNotification(userId, notification) {
  try {
    const io = getIO();
    if (!io) {
      console.warn("[NotificationService] Socket.IO instance not initialized");
      return;
    }

    const cleanUserId = normalizeUserId(userId);
    const room = `user:${cleanUserId}`;
    console.log(`Emitting notification to: ${room}`);
    io.to(room).emit("notification:new", notification);
  } catch (error) {
    console.warn("[NotificationService] Socket emit error:", error.message);
  }
}

/**
 * Send Web Push notification to all user devices.
 * Removes invalid/expired subscriptions.
 */
async function sendPushNotification(userId, payload) {
  if (!vapidPublicKey) {
    console.warn("[WebPush] VAPID keys not configured — skipping push");
    return;
  }

  try {
    const cleanUserId = normalizeUserId(userId);
    const subscriptions = await PushSubscription.find({ user: cleanUserId });

    if (subscriptions.length === 0) {
      console.log(`[WebPush] No push subscriptions found for user ${cleanUserId} — skipping push`);
      return;
    }

    console.log(`[WebPush] Sending push to ${subscriptions.length} device(s) for user ${cleanUserId}`);
    console.log(`[WebPush] Payload: title="${payload.title}" type=${payload.type} url=${payload.url}`);

    // Build the JSON payload that the Service Worker will parse.
    // Structure MUST match what sw.js reads:
    //   top-level: title, body, icon, badge
    //   nested data: { notificationId, complaintId, type, url }
    const pushPayload = JSON.stringify({
      title:  payload.title,
      body:   payload.body,
      // Use small optimized icons — favicon.png is 1.2 MB and is silently
      // rejected by Chrome on Android when used as a push notification icon.
      icon:  "/icon-192.png",
      badge: "/badge-72.png",
      // Nested data object — read in SW as payload.data.*
      data: {
        notificationId: payload.notificationId || null,
        complaintId:    payload.complaintId    || null,
        type:           payload.type           || "SYSTEM",
        url:            payload.url            || "/"
      }
    });

    // Web Push options:
    //   TTL: 86400s (24 hours) — how long FCM stores message if device offline
    //   urgency: 'high' — bypasses Android Doze/battery-saver delays when
    //                      phone is locked or screen is off. Without this,
    //                      Doze can batch push delivery by hours.
    const webPushOptions = {
      TTL: 86400,
      urgency: 'high'
    };

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        console.log(`[WebPush] → Sending to endpoint: ${sub.endpoint.slice(0, 60)}... (device: ${sub.deviceName || 'unknown'})`);
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth:   sub.keys.auth
            }
          },
          pushPayload,
          webPushOptions
        );
        console.log(`[WebPush] ✓ Push sent successfully to device: ${sub.deviceName || sub._id}`);
      } catch (err) {
        // 410 Gone or 404 = subscription expired/invalid (user uninstalled app)
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`[WebPush] Subscription expired (${err.statusCode}), removing: ${sub._id}`);
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error(`[WebPush] ✗ Send failed for device ${sub.deviceName || sub._id}:`, err.statusCode, err.message);
        }
      }
    });

    await Promise.allSettled(sendPromises);
    console.log(`[WebPush] Push dispatch complete for user ${cleanUserId}`);
  } catch (error) {
    console.error("[WebPush] Push dispatch failed:", error.message);
  }
}

/**
 * Helper to build deep-link URL based on notification type and complaint ID
 */
function buildNotificationUrl(type, complaintId) {
  if (!complaintId) return "/";

  switch (type) {
    case "COMPLAINT_CREATED":
      return `/admin/complaints/${complaintId}`;
    case "COMPLAINT_ASSIGNED":
    case "STAFF_UNASSIGNED":
      return `/staff/complaints/${complaintId}`;
    case "WORK_IN_PROGRESS":
    case "WORK_COMPLETED":
    case "COMPLAINT_RESOLVED":
    case "COMPLAINT_REJECTED":
    case "PRIORITY_CHANGED":
      return `/citizen/complaints/${complaintId}`;
    case "COMPLAINT_REOPENED":
      return `/admin/complaints/${complaintId}`;
    default:
      return `/citizen/complaints/${complaintId}`;
  }
}

export default {
  createNotification,
  createBulkNotifications
};
