import mongoose, { Schema } from "mongoose";

const pushSubscriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    endpoint: {
      type: String,
      required: true
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    },
    deviceName: {
      type: String,
      default: "Unknown Device"
    },
    userAgent: {
      type: String,
      default: ""
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Each endpoint is globally unique (same browser/device cannot register twice)
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });
// Fast lookup by user
pushSubscriptionSchema.index({ user: 1, createdAt: -1 });

export const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);
export default PushSubscription;
