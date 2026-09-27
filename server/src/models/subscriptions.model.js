import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    default: "active"
  },
}, {timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

