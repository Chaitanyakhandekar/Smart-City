import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reciever: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isSeen: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: "text" // or whatever types you have
  },
  content: {
    type: String,
    default: ""
  },
}, {timestamps: true});

export const Message = mongoose.model("Message", messageSchema);