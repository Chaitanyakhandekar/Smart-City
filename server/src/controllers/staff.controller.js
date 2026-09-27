import { Complaint } from "../models/complaints.model.js";
import { ComplaintImage } from "../models/complaintImages.model.js";
import { ComplaintUpdate } from "../models/complaintUpdates.model.js";
import { Notification } from "../models/notifications.model.js";
import { User } from "../models/users.model.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Staff Dashboard Summary
 */
export const getStaffDashboard = asyncHandler(async (req, res) => {
  const staffId = req.user._id;

  const assigned = await Complaint.countDocuments({
    assignedStaff: staffId,
    status: "ASSIGNED"
  });

  const inProgress = await Complaint.countDocuments({
    assignedStaff: staffId,
    status: "IN_PROGRESS"
  });

  const resolved = await Complaint.countDocuments({
    assignedStaff: staffId,
    status: "RESOLVED"
  });

  const highPriority = await Complaint.countDocuments({
    assignedStaff: staffId,
    status: { $in: ["ASSIGNED", "IN_PROGRESS"] },
    priority: { $in: ["HIGH", "CRITICAL"] }
  });

  const recentTasks = await Complaint.find({ assignedStaff: staffId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("citizen", "name phone");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          assigned,
          inProgress,
          resolved,
          highPriority
        },
        recentTasks
      },
      "Staff dashboard statistics retrieved."
    )
  );
});

/**
 * Staff Tasks List
 */
export const getStaffTasks = asyncHandler(async (req, res) => {
  const staffId = req.user._id;
  const { status, priority, search } = req.query;

  const filter = { assignedStaff: staffId };

  if (status && status !== "ALL") {
    filter.status = status;
  }
  if (priority && priority !== "ALL") {
    filter.priority = priority;
  }
  if (search && search.trim() !== "") {
    filter.$or = [
      { complaintNumber: { $regex: search.trim(), $options: "i" } },
      { title: { $regex: search.trim(), $options: "i" } },
      { locationAddress: { $regex: search.trim(), $options: "i" } }
    ];
  }

  const tasks = await Complaint.find(filter)
    .sort({ updatedAt: -1 })
    .populate("citizen", "name phone email");

  const taskIds = tasks.map((t) => t._id);
  const images = await ComplaintImage.find({ complaint: { $in: taskIds } });

  const tasksWithImages = tasks.map((t) => {
    const tObj = t.toObject();
    const taskImgs = images.filter((img) => img.complaint.toString() === t._id.toString());
    tObj.beforeImage = taskImgs.find((img) => img.imageType === "BEFORE")?.imageUrl || null;
    tObj.afterImage = taskImgs.find((img) => img.imageType === "AFTER")?.imageUrl || null;
    return tObj;
  });

  res.status(200).json(
    new ApiResponse(200, { tasks: tasksWithImages }, "Staff assigned tasks fetched.")
  );
});

/**
 * Staff: Start Work on Complaint (ASSIGNED -> IN_PROGRESS)
 */
export const startWorkOnTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  // Verify staff ownership
  if (!complaint.assignedStaff || complaint.assignedStaff.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not assigned to work on this complaint.");
  }

  if (complaint.status !== "ASSIGNED" && complaint.status !== "REOPENED") {
    throw new ApiError(400, `Cannot start work on complaint with current status: ${complaint.status}`);
  }

  complaint.status = "IN_PROGRESS";
  await complaint.save();

  let progressImage = null;
  if (req.file) {
    progressImage = await ComplaintImage.create({
      complaint: complaint._id,
      imageUrl: `/uploads/${req.file.filename}`,
      imageType: "PROGRESS",
      uploadedBy: req.user._id
    });
  }

  const updateMessage = remarks
    ? `Work started by ${req.user.name} (${req.user.designation || "Staff"}). Remarks: "${remarks.trim()}"`
    : `Work started on site by ${req.user.name} (${req.user.designation || "Staff"}).`;

  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: "IN_PROGRESS",
    message: updateMessage
  });

  // Notify Citizen
  await Notification.create({
    recipient: complaint.citizen,
    type: "STATUS_UPDATE",
    title: "Work In Progress",
    message: `Staff ${req.user.name} has commenced work on complaint ${complaint.complaintNumber}.`,
    complaint: complaint._id
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { complaint, progressImage },
      "Complaint status updated to IN_PROGRESS."
    )
  );
});

/**
 * Staff: Mark Complaint as Resolved (IN_PROGRESS -> RESOLVED)
 * Requires resolution remarks and AFTER image upload
 */
export const resolveTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  if (!remarks || remarks.trim().length < 5) {
    throw new ApiError(400, "Detailed resolution remarks (at least 5 characters) are required.");
  }

  if (!req.file) {
    throw new ApiError(400, "Resolution 'AFTER' photograph is strictly required to mark complaint as resolved.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  // Verify staff assignment
  if (!complaint.assignedStaff || complaint.assignedStaff.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not assigned to this complaint.");
  }

  if (complaint.status !== "IN_PROGRESS" && complaint.status !== "ASSIGNED") {
    throw new ApiError(400, `Cannot resolve complaint in status: ${complaint.status}`);
  }

  const afterImage = await ComplaintImage.create({
    complaint: complaint._id,
    imageUrl: `/uploads/${req.file.filename}`,
    imageType: "AFTER",
    uploadedBy: req.user._id
  });

  complaint.status = "RESOLVED";
  complaint.resolvedAt = new Date();
  complaint.citizenConfirmed = null; // Awaiting citizen confirmation
  await complaint.save();

  // Log timeline
  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: "RESOLVED",
    message: `Issue resolved by ${req.user.name}. Resolution remarks: "${remarks.trim()}". After-resolution photo uploaded.`
  });

  // Notify Citizen with Before/After review prompt
  await Notification.create({
    recipient: complaint.citizen,
    type: "COMPLAINT_RESOLVED",
    title: "Complaint Resolved — Review Needed",
    message: `Your complaint ${complaint.complaintNumber} was marked RESOLVED. Please review the before/after photos and confirm or reopen.`,
    complaint: complaint._id
  });

  // Notify Admins
  const admins = await User.find({ role: "ADMIN", isActive: true });
  const adminNotifications = admins.map((admin) => ({
    recipient: admin._id,
    type: "COMPLAINT_RESOLVED",
    title: "Complaint Resolved",
    message: `Complaint ${complaint.complaintNumber} has been marked resolved by staff ${req.user.name}.`,
    complaint: complaint._id
  }));
  if (adminNotifications.length > 0) {
    await Notification.insertMany(adminNotifications);
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { complaint, afterImage },
      "Complaint successfully marked as RESOLVED."
    )
  );
});

/**
 * Staff: Upload interim progress image or remarks
 */
export const uploadProgressUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  const complaint = await Complaint.findById(id);
  if (!complaint) throw new ApiError(404, "Complaint not found.");

  if (!complaint.assignedStaff || complaint.assignedStaff.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied.");
  }

  let progressImage = null;
  if (req.file) {
    progressImage = await ComplaintImage.create({
      complaint: complaint._id,
      imageUrl: `/uploads/${req.file.filename}`,
      imageType: "PROGRESS",
      uploadedBy: req.user._id
    });
  }

  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: complaint.status,
    message: remarks || "Progress update and photo added by field staff."
  });

  res.status(200).json(
    new ApiResponse(200, { progressImage }, "Progress update logged.")
  );
});
