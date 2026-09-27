import mongoose, { Schema } from 'mongoose';

const complaintImageSchema = new Schema(
  {
    complaint: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"]
    },
    imageType: {
      type: String,
      enum: ["BEFORE", "PROGRESS", "AFTER"],
      default: "BEFORE",
      required: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const ComplaintImage = mongoose.model("ComplaintImage", complaintImageSchema);
export default ComplaintImage;
