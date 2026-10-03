import mongoose, { Schema } from 'mongoose';

const NOTIFICATION_TYPES = [
  "COMPLAINT_CREATED",
  "COMPLAINT_ASSIGNED",
  "COMPLAINT_STATUS_CHANGED",
  "COMPLAINT_IN_PROGRESS",
  "COMPLAINT_RESOLVED",
  "COMPLAINT_REOPENED",
  "COMPLAINT_REJECTED",
  "PRIORITY_CHANGED",
  "DUPLICATE_DETECTED",
  "STAFF_ASSIGNED",
  "STAFF_UNASSIGNED",
  "ADMIN_MESSAGE",
  "SYSTEM",
  // Legacy types preserved for backward compatibility
  "NEW_COMPLAINT",
  "COMPLAINT_SUBMITTED",
  "NEW_ASSIGNMENT",
  "STATUS_UPDATE",
  "RESOLUTION_CONFIRMED"
];

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "SYSTEM"
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    complaint: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      default: null
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Compound indexes for efficient notification queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export { NOTIFICATION_TYPES };
export const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;