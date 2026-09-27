import { Notification } from "../models/notifications.model.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("complaint", "complaintNumber title status");

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { notifications, unreadCount },
      "Notifications fetched successfully."
    )
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  res.status(200).json(
    new ApiResponse(200, { notification }, "Notification marked as read.")
  );
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json(
    new ApiResponse(200, {}, "All notifications marked as read.")
  );
});
