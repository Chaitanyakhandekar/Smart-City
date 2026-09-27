import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      default: "STATUS_UPDATE"
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
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;