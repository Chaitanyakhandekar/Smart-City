import { Complaint } from "../models/complaints.model.js";
import { ComplaintImage } from "../models/complaintImages.model.js";
import { ComplaintUpdate } from "../models/complaintUpdates.model.js";
import { User, DEPARTMENTS } from "../models/users.model.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification, createBulkNotifications } from "../services/notification.service.js";

/**
 * Admin: Real Dashboard Metrics and Aggregations from MongoDB Atlas
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const total = await Complaint.countDocuments();
  const submitted = await Complaint.countDocuments({ status: "SUBMITTED" });
  const underReview = await Complaint.countDocuments({ status: "UNDER_REVIEW" });
  const assigned = await Complaint.countDocuments({ status: "ASSIGNED" });
  const inProgress = await Complaint.countDocuments({ status: "IN_PROGRESS" });
  const resolved = await Complaint.countDocuments({ status: "RESOLVED" });
  const reopened = await Complaint.countDocuments({ status: "REOPENED" });
  const rejected = await Complaint.countDocuments({ status: "REJECTED" });
  const highPriority = await Complaint.countDocuments({ priority: { $in: ["HIGH", "CRITICAL"] } });

  // Group by category
  const categoryAgg = await Complaint.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Group by status
  const statusAgg = await Complaint.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  // Group by priority
  const priorityAgg = await Complaint.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } }
  ]);

  // Recent 8 complaints
  const recentComplaints = await Complaint.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("citizen", "name email")
    .populate("assignedStaff", "name department");

  // Total active staff count
  const totalStaff = await User.countDocuments({ role: "STAFF", isActive: true });
  const totalCitizens = await User.countDocuments({ role: "CITIZEN" });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          total,
          submitted,
          underReview,
          assigned,
          inProgress,
          resolved,
          reopened,
          rejected,
          highPriority,
          totalStaff,
          totalCitizens
        },
        categoryData: categoryAgg.map((item) => ({ name: item._id, value: item.count })),
        statusData: statusAgg.map((item) => ({ name: item._id, value: item.count })),
        priorityData: priorityAgg.map((item) => ({ name: item._id, value: item.count })),
        recentComplaints
      },
      "Admin dashboard aggregations fetched successfully."
    )
  );
});

/**
 * Admin: Get All Complaints with comprehensive filtering, search, and pagination
 */
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, staff, search, page = 1, limit = 15 } = req.query;

  const filter = {};

  if (status && status !== "ALL") filter.status = status;
  if (category && category !== "ALL") filter.category = category;
  if (priority && priority !== "ALL") filter.priority = priority;
  if (staff && staff !== "ALL") filter.assignedStaff = staff;

  if (search && search.trim() !== "") {
    filter.$or = [
      { complaintNumber: { $regex: search.trim(), $options: "i" } },
      { title: { $regex: search.trim(), $options: "i" } },
      { locationAddress: { $regex: search.trim(), $options: "i" } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Complaint.countDocuments(filter);

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("citizen", "name email phone")
    .populate("assignedStaff", "name department designation phone");

  const complaintIds = complaints.map((c) => c._id);
  const images = await ComplaintImage.find({ complaint: { $in: complaintIds } });

  const formattedComplaints = complaints.map((c) => {
    const cObj = c.toObject();
    const compImgs = images.filter((img) => img.complaint.toString() === c._id.toString());
    cObj.beforeImage = compImgs.find((img) => img.imageType === "BEFORE")?.imageUrl || null;
    cObj.afterImage = compImgs.find((img) => img.imageType === "AFTER")?.imageUrl || null;
    return cObj;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        complaints: formattedComplaints,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit)
        }
      },
      "All complaints fetched."
    )
  );
});

/**
 * Admin: Update Complaint Details (Override Category, Priority, Subcategory, Status)
 */
export const updateComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, subcategory, priority, status } = req.body;

  const complaint = await Complaint.findById(id);
  if (!complaint) throw new ApiError(404, "Complaint not found.");

  const oldPriority = complaint.priority;
  const oldStatus = complaint.status;
  let changes = [];

  if (category && category !== complaint.category) {
    changes.push(`Category changed from "${complaint.category}" to "${category}"`);
    complaint.category = category;
  }
  if (subcategory !== undefined && subcategory !== complaint.subcategory) {
    complaint.subcategory = subcategory;
  }
  if (priority && priority !== complaint.priority) {
    changes.push(`Priority changed from "${complaint.priority}" to "${priority}"`);
    complaint.priority = priority;
  }
  if (status && status !== complaint.status) {
    changes.push(`Status changed from "${complaint.status}" to "${status}"`);
    complaint.status = status;
  }

  await complaint.save();

  if (changes.length > 0) {
    await ComplaintUpdate.create({
      complaint: complaint._id,
      user: req.user._id,
      status: complaint.status,
      message: `Admin ${req.user.name} reviewed complaint: ${changes.join(", ")}.`
    });

    // Notify citizen of changes
    try {
      const notifications = [];

      if (priority && priority !== oldPriority) {
        notifications.push({
          recipientId: complaint.citizen,
          type: "PRIORITY_CHANGED",
          title: "Complaint Priority Updated",
          message: `Your complaint ${complaint.complaintNumber} priority has been updated to ${priority}.`,
          complaintId: complaint._id,
          actorId: req.user._id
        });
      }

      if (status && status !== oldStatus) {
        const statusMessages = {
          UNDER_REVIEW: "Your complaint is now under review by the administration.",
          ASSIGNED: "Your complaint has been assigned to a staff member.",
          IN_PROGRESS: "Staff has started working on your complaint.",
          RESOLVED: "Your complaint has been marked as resolved.",
          REJECTED: "Your complaint has been reviewed and could not be processed.",
          REOPENED: "Your complaint has been reopened for further investigation."
        };

        notifications.push({
          recipientId: complaint.citizen,
          type: "COMPLAINT_STATUS_CHANGED",
          title: `Complaint ${status.replace("_", " ")}`,
          message: statusMessages[status] || `Your complaint ${complaint.complaintNumber} status changed to ${status}.`,
          complaintId: complaint._id,
          actorId: req.user._id
        });
      }

      // Notify assigned staff of priority changes
      if (priority && priority !== oldPriority && complaint.assignedStaff) {
        notifications.push({
          recipientId: complaint.assignedStaff,
          type: "PRIORITY_CHANGED",
          title: "Task Priority Changed",
          message: `Complaint ${complaint.complaintNumber} priority updated to ${priority} by admin.`,
          complaintId: complaint._id,
          actorId: req.user._id
        });
      }

      if (notifications.length > 0) {
        await createBulkNotifications(notifications);
      }
    } catch (notifErr) {
      console.error("[Admin] Notification error (non-fatal):", notifErr.message);
    }
  }

  res.status(200).json(
    new ApiResponse(200, { complaint }, "Complaint updated successfully.")
  );
});

/**
 * Admin: Assign or Reassign Staff
 */
export const assignStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { staffId, remarks } = req.body;

  if (!staffId) {
    throw new ApiError(400, "Please select a staff member to assign.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) throw new ApiError(404, "Complaint not found.");

  const staff = await User.findOne({ _id: staffId, role: "STAFF", isActive: true });
  if (!staff) {
    throw new ApiError(404, "Active staff member not found.");
  }

  const isReassignment = !!complaint.assignedStaff;
  const previousStaffId = complaint.assignedStaff;
  complaint.assignedStaff = staff._id;
  complaint.status = "ASSIGNED";
  await complaint.save();

  const actionText = isReassignment
    ? `Reassigned to ${staff.name} (${staff.department} - ${staff.designation || "Field Officer"}) by Admin ${req.user.name}.`
    : `Assigned to ${staff.name} (${staff.department} - ${staff.designation || "Field Officer"}) by Admin ${req.user.name}.`;

  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: "ASSIGNED",
    message: remarks ? `${actionText} Note: "${remarks}"` : actionText
  });

  // Send notifications
  try {
    const notifications = [];

    // Notify newly assigned staff
    notifications.push({
      recipientId: staff._id,
      type: "COMPLAINT_ASSIGNED",
      title: isReassignment ? "Task Reassigned to You" : "New Task Assigned",
      message: `You have been assigned to handle complaint ${complaint.complaintNumber} (${complaint.category}) at ${complaint.locationAddress}.`,
      complaintId: complaint._id,
      actorId: req.user._id
    });

    // Notify citizen
    notifications.push({
      recipientId: complaint.citizen,
      type: "COMPLAINT_ASSIGNED",
      title: "Staff Assigned",
      message: `Municipal officer ${staff.name} (${staff.department}) has been assigned to resolve your complaint ${complaint.complaintNumber}.`,
      complaintId: complaint._id,
      actorId: req.user._id
    });

    // If reassignment, notify previous staff they've been unassigned
    if (isReassignment && previousStaffId && previousStaffId.toString() !== staff._id.toString()) {
      notifications.push({
        recipientId: previousStaffId,
        type: "STAFF_UNASSIGNED",
        title: "Task Reassigned",
        message: `Complaint ${complaint.complaintNumber} has been reassigned to another staff member.`,
        complaintId: complaint._id,
        actorId: req.user._id
      });
    }

    await createBulkNotifications(notifications);
  } catch (notifErr) {
    console.error("[Admin] Notification error (non-fatal):", notifErr.message);
  }

  res.status(200).json(
    new ApiResponse(200, { complaint, staff }, `Complaint successfully assigned to ${staff.name}.`)
  );
});

/**
 * Admin: Reject invalid or duplicate complaint
 */
export const rejectComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 5) {
    throw new ApiError(400, "Rejection reason (at least 5 characters) is required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) throw new ApiError(404, "Complaint not found.");

  complaint.status = "REJECTED";
  await complaint.save();

  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: "REJECTED",
    message: `Complaint rejected by Admin ${req.user.name}. Reason: "${reason.trim()}".`
  });

  // Notify Citizen
  try {
    await createNotification({
      recipientId: complaint.citizen,
      type: "COMPLAINT_REJECTED",
      title: "Complaint Rejected",
      message: `Your complaint ${complaint.complaintNumber} could not be processed. Reason: ${reason.trim()}`,
      complaintId: complaint._id,
      actorId: req.user._id
    });
  } catch (notifErr) {
    console.error("[Admin] Notification error (non-fatal):", notifErr.message);
  }

  res.status(200).json(
    new ApiResponse(200, { complaint }, "Complaint rejected.")
  );
});

/**
 * Admin: Staff Management - Get All Staff with Workload Metrics
 */
export const getStaffList = asyncHandler(async (req, res) => {
  const staffMembers = await User.find({ role: "STAFF" })
    .select("-password")
    .sort({ createdAt: -1 });

  // Calculate workloads for each staff member
  const staffWithCounts = await Promise.all(
    staffMembers.map(async (staff) => {
      const staffObj = staff.toObject();
      staffObj.assignedCount = await Complaint.countDocuments({
        assignedStaff: staff._id,
        status: { $in: ["ASSIGNED", "IN_PROGRESS", "REOPENED"] }
      });
      staffObj.resolvedCount = await Complaint.countDocuments({
        assignedStaff: staff._id,
        status: "RESOLVED"
      });
      return staffObj;
    })
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { staff: staffWithCounts, departments: DEPARTMENTS },
      "Staff directory fetched."
    )
  );
});

/**
 * Admin: Staff Management - Create New Staff Member
 */
export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone, employeeId, department, designation } = req.body;

  if (!name || !email || !password || !department) {
    throw new ApiError(400, "Name, email, password, and department are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists.");
  }

  const staff = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone || "",
    role: "STAFF",
    employeeId: employeeId || `EMP-${Date.now().toString().slice(-4)}`,
    department,
    designation: designation || "Field Engineer",
    isActive: true
  });

  const staffResponse = await User.findById(staff._id).select("-password");

  res.status(201).json(
    new ApiResponse(201, { staff: staffResponse }, `Staff account for ${name} created successfully.`)
  );
});

/**
 * Admin: Staff Management - Toggle Staff Active/Inactive
 */
export const toggleStaffStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const staff = await User.findOne({ _id: id, role: "STAFF" });
  if (!staff) throw new ApiError(404, "Staff member not found.");

  staff.isActive = !staff.isActive;
  await staff.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { staff: { _id: staff._id, isActive: staff.isActive } },
      `Staff ${staff.name} is now ${staff.isActive ? "ACTIVE" : "DEACTIVATED"}.`
    )
  );
});
