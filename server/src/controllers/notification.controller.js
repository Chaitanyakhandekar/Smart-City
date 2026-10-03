import { Notification } from "../models/notifications.model.js";
import { PushSubscription } from "../models/pushSubscription.model.js";
import { vapidPublicKey } from "../services/webpush.service.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /notifications
 * Get current user's notifications (paginated)
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 30));
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("complaint", "complaintNumber title status");

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  const total = await Notification.countDocuments({ recipient: req.user._id });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      },
      "Notifications fetched successfully."
    )
  );
});

/**
 * GET /notifications/unread-count
 * Get only the unread notification count (lightweight)
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, "Unread count fetched.")
  );
});

/**
 * PATCH /notifications/:id/read
 * Mark a single notification as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  res.status(200).json(
    new ApiResponse(200, { notification }, "Notification marked as read.")
  );
});

/**
 * PATCH /notifications/read-all
 * Mark all current user's notifications as read
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json(
    new ApiResponse(200, {}, "All notifications marked as read.")
  );
});

/**
 * GET /notifications/vapid-public-key
 * Return the VAPID public key for frontend push subscription
 */
export const getVapidPublicKey = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { vapidPublicKey: vapidPublicKey || "" }, "VAPID public key.")
  );
});

/**
 * POST /notifications/push/subscribe
 * Subscribe a device for push notifications
 */
export const pushSubscribe = asyncHandler(async (req, res) => {
  const { subscription, deviceName } = req.body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json(
      new ApiResponse(400, null, "Invalid push subscription data.")
    );
  }

  // Upsert: if endpoint already exists, update it (same device re-subscribing)
  const pushSub = await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      user: req.user._id,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      deviceName: deviceName || "Unknown Device",
      userAgent: req.headers["user-agent"] || "",
      lastUsedAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(
    new ApiResponse(201, { subscription: pushSub }, "Push subscription registered.")
  );
});

/**
 * DELETE /notifications/push/unsubscribe
 * Remove a push subscription
 */
export const pushUnsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json(
      new ApiResponse(400, null, "Endpoint is required.")
    );
  }

  await PushSubscription.deleteOne({
    endpoint,
    user: req.user._id
  });

  res.status(200).json(
    new ApiResponse(200, {}, "Push subscription removed.")
  );
});
