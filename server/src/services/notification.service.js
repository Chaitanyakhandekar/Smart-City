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
    return; // Web Push not configured
  }

  try {
    const cleanUserId = normalizeUserId(userId);
    const subscriptions = await PushSubscription.find({ user: cleanUserId });
    if (subscriptions.length === 0) return;

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      data: {
        notificationId: payload.notificationId,
        complaintId: payload.complaintId,
        type: payload.type,
        url: payload.url || "/"
      }
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          },
          pushPayload
        );
      } catch (err) {
        // If subscription has expired or is invalid (410 Gone or 404 Not Found), delete it
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`[NotificationService] Removing expired push subscription for user ${cleanUserId}`);
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.warn(`[NotificationService] WebPush send error for endpoint:`, err.message);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.warn("[NotificationService] Push dispatch failed:", error.message);
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
