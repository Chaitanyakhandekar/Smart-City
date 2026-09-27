import { Complaint } from "../models/complaints.model.js";

/**
 * Generates sequential, collision-free complaint numbers formatted as SC-YYYY-XXXXXX
 */
export async function generateComplaintNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `SC-${currentYear}-`;

  // Find highest existing complaint number for current year
  const latestComplaint = await Complaint.findOne({
    complaintNumber: new RegExp(`^${prefix}`)
  })
    .sort({ complaintNumber: -1 })
    .select("complaintNumber");

  let nextSequence = 1;
  if (latestComplaint && latestComplaint.complaintNumber) {
    const parts = latestComplaint.complaintNumber.split("-");
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(6, "0");
  return `${prefix}${paddedSequence}`;
}

export default generateComplaintNumber;
