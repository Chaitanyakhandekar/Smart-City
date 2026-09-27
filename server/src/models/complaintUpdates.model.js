import mongoose, { Schema } from 'mongoose';

const complaintUpdateSchema = new Schema(
  {
    complaint: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    status: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      required: [true, "Update message is required"]
    }
  },
  { timestamps: true }
);

export const ComplaintUpdate = mongoose.model("ComplaintUpdate", complaintUpdateSchema);
export default ComplaintUpdate;
