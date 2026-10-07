import { Complaint } from "../models/complaints.model.js";
import { ComplaintImage } from "../models/complaintImages.model.js";
import { ComplaintUpdate } from "../models/complaintUpdates.model.js";
import { User } from "../models/users.model.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateComplaintNumber } from "../utils/complaintNumber.js";
import { analyzeComplaintImageAndText } from "../services/aiService.js";
import { createNotification, createBulkNotifications } from "../services/notification.service.js";

/**
 * Citizen: Submit a new civic complaint with image
 */
export const createComplaint = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    subcategory,
    priority,
    locationAddress,
    aiCategory,
    aiSubcategory,
    aiConfidence,
    aiPriority
  } = req.body;

  if (!title || !description || !locationAddress) {
    throw new ApiError(400, "Title, description, and location address are required.");
  }

  const complaintNumber = await generateComplaintNumber();
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Run AI classification automatically
  let finalAiCat = aiCategory || "";
  let finalAiSub = aiSubcategory || "";
  let finalAiConf = aiConfidence ? Number(aiConfidence) : 0;
  let finalAiPrio = aiPriority || priority || "MEDIUM";

  try {
    const aiResult = await analyzeComplaintImageAndText({
      imagePath: req.file ? req.file.path : null,
      description: description.trim()
    });

    if (aiResult) {
      finalAiCat = aiResult.category || finalAiCat || "Other";
      finalAiSub = aiResult.subcategory || finalAiSub || "";
      finalAiConf = typeof aiResult.confidence === "number" ? aiResult.confidence : 0.85;
      finalAiPrio = aiResult.priority || finalAiPrio || "MEDIUM";
    }
  } catch (aiError) {
    console.error("[Complaint Creation AI Error - Safe Fallback]", aiError.message);
    if (!finalAiCat) finalAiCat = "Other";
    if (!finalAiSub) finalAiSub = "General Issue";
    if (!finalAiPrio) finalAiPrio = priority || "MEDIUM";
  }

  // Derive final category and priority (favoring user override if specified, else AI classification)
  const resolvedCategory = (category && category.trim() !== "" && category !== "Auto-Detect")
    ? category
    : (finalAiCat || "Other");

  const resolvedPriority = (priority && priority.trim() !== "")
    ? priority
    : (finalAiPrio || "MEDIUM");

  const complaint = await Complaint.create({
    complaintNumber,
    citizen: req.user._id,
    title: title.trim(),
    description: description.trim(),
    category: resolvedCategory,
    subcategory: subcategory || finalAiSub,
    aiCategory: finalAiCat,
    aiSubcategory: finalAiSub,
    aiConfidence: finalAiConf,
    priority: resolvedPriority,
    aiPriority: finalAiPrio,
    status: "SUBMITTED",
    locationAddress: locationAddress.trim()
  });

  // Save BEFORE image record if photo provided
  let complaintImage = null;
  if (imageUrl) {
    complaintImage = await ComplaintImage.create({
      complaint: complaint._id,
      imageUrl,
      imageType: "BEFORE",
      uploadedBy: req.user._id
    });
  }

  // Log timeline creation
  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: "SUBMITTED",
    message: `Complaint registered by ${req.user.name}. AI auto-classification: ${finalAiCat}${finalAiSub ? ` (${finalAiSub})` : ""} - Priority: ${finalAiPrio} (${Math.round(finalAiConf * 100)}% confidence).`
  });

  // Notify Admins via central notification service
  try {
    const admins = await User.find({ role: "ADMIN", isActive: true });
    const isCritical = ["HIGH", "CRITICAL"].includes(resolvedPriority);

    await createBulkNotifications(
      admins.map((admin) => ({
        recipientId: admin._id,
        type: "COMPLAINT_CREATED",
        title: isCritical ? "⚠️ Critical Complaint Submitted" : "New Complaint Submitted",
        message: `New issue ${complaintNumber} reported in ${resolvedCategory} at ${locationAddress}.`,
        complaintId: complaint._id,
        actorId: req.user._id
      }))
    );

    // Notify citizen of successful creation
    await createNotification({
      recipientId: req.user._id,
      type: "COMPLAINT_CREATED",
      title: "Complaint Registered",
      message: `Your complaint ${complaintNumber} has been received and queued for review.`,
      complaintId: complaint._id
    });
  } catch (notifErr) {
    console.error("[Complaint] Notification delivery error (non-fatal):", notifErr.message);
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        complaint,
        beforeImage: complaintImage
      },
      `Complaint ${complaintNumber} submitted successfully.`
    )
  );
});

/**
 * Citizen: Get all complaints filed by current user
 */
export const getMyComplaints = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;

  const filter = { citizen: req.user._id };

  if (status && status !== "ALL") {
    filter.status = status;
  }
  if (category && category !== "ALL") {
    filter.category = category;
  }
  if (search && search.trim() !== "") {
    filter.$or = [
      { complaintNumber: { $regex: search.trim(), $options: "i" } },
      { title: { $regex: search.trim(), $options: "i" } },
      { locationAddress: { $regex: search.trim(), $options: "i" } }
    ];
  }

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .populate("assignedStaff", "name department designation phone");

  // Fetch before images for card previews
  const complaintIds = complaints.map((c) => c._id);
  const images = await ComplaintImage.find({
    complaint: { $in: complaintIds }
  });

  const complaintMap = complaints.map((c) => {
    const compObj = c.toObject();
    compObj.images = images.filter((img) => img.complaint.toString() === c._id.toString());
    compObj.beforeImage = compObj.images.find((img) => img.imageType === "BEFORE")?.imageUrl || null;
    compObj.afterImage = compObj.images.find((img) => img.imageType === "AFTER")?.imageUrl || null;
    return compObj;
  });

  res.status(200).json(
    new ApiResponse(200, { complaints: complaintMap }, "Citizen complaints retrieved.")
  );
});

/**
 * Get single complaint details (Accessible by Owner Citizen, Assigned Staff, or Admin)
 */
export const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isObjectId ? { _id: id } : { complaintNumber: id.trim().toUpperCase() };

  const complaint = await Complaint.findOne(query)
    .populate("citizen", "name email phone avatar")
    .populate("assignedStaff", "name email phone department designation avatar");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  // Security authorization check
  const isOwner = complaint.citizen._id.toString() === req.user._id.toString();
  const isAssignedStaff = complaint.assignedStaff && complaint.assignedStaff._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "ADMIN";

  if (!isOwner && !isAssignedStaff && !isAdmin) {
    throw new ApiError(403, "You do not have permission to view this complaint.");
  }

  // Fetch all images
  const images = await ComplaintImage.find({ complaint: complaint._id })
    .populate("uploadedBy", "name role")
    .sort({ createdAt: 1 });

  // Fetch timeline updates
  const timeline = await ComplaintUpdate.find({ complaint: complaint._id })
    .populate("user", "name role designation")
    .sort({ createdAt: 1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        complaint,
        images,
        timeline,
        beforeImage: images.find((i) => i.imageType === "BEFORE") || null,
        progressImages: images.filter((i) => i.imageType === "PROGRESS"),
        afterImage: images.find((i) => i.imageType === "AFTER") || null
      },
      "Complaint details fetched successfully."
    )
  );
});

/**
 * Citizen: Confirm resolution of complaint
 */
export const confirmResolution = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (complaint.citizen.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the reporting citizen can confirm resolution.");
  }

  if (complaint.status !== "RESOLVED") {
    throw new ApiError(400, "Only complaints marked as RESOLVED can be confirmed.");
  }

  complaint.citizenConfirmed = true;
  await complaint.save();

  // Log timeline
  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: "RESOLVED",
    message: `Citizen ${req.user.name} confirmed the issue is fully resolved. Case closed.`
  });

  // Notify assigned staff if present
  try {
    if (complaint.assignedStaff) {
      await createNotification({
        recipientId: complaint.assignedStaff,
        type: "COMPLAINT_STATUS_CHANGED",
        title: "Resolution Confirmed",
        message: `Citizen confirmed satisfactory resolution for ${complaint.complaintNumber}. Great work!`,
        complaintId: complaint._id,
        actorId: req.user._id
      });
    }
  } catch (notifErr) {
    console.error("[Complaint] Notification error (non-fatal):", notifErr.message);
  }

  res.status(200).json(
    new ApiResponse(200, { complaint }, "Resolution confirmed successfully. Thank you!")
  );
});

/**
 * Citizen: Reopen complaint
 */
export const reopenComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reopenReason } = req.body;

  if (!reopenReason || reopenReason.trim().length < 5) {
    throw new ApiError(400, "A detailed reason (at least 5 characters) is required to reopen this complaint.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, "Complaint not found.");
  }

  if (complaint.citizen.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the reporting citizen can reopen this complaint.");
  }

  if (complaint.status !== "RESOLVED") {
    throw new ApiError(400, "Only complaints marked as RESOLVED can be reopened.");
  }

  complaint.status = "REOPENED";
  complaint.citizenConfirmed = false;
  complaint.reopenReason = reopenReason.trim();
  complaint.priority = "HIGH"; // Reopened complaints are automatically prioritized
  await complaint.save();

  // Log timeline
  await ComplaintUpdate.create({
    complaint: complaint._id,
    user: req.user._id,
    status: "REOPENED",
    message: `Citizen ${req.user.name} reopened the complaint. Reason: "${reopenReason.trim()}". Priority escalated to HIGH.`
  });

  // Notify Admins + assigned staff
  try {
    const admins = await User.find({ role: "ADMIN", isActive: true });
    await createBulkNotifications(
      admins.map((admin) => ({
        recipientId: admin._id,
        type: "COMPLAINT_REOPENED",
        title: "Complaint Reopened",
        message: `Complaint ${complaint.complaintNumber} was reopened by citizen. Reason: ${reopenReason.trim()}`,
        complaintId: complaint._id,
        actorId: req.user._id
      }))
    );

    if (complaint.assignedStaff) {
      await createNotification({
        recipientId: complaint.assignedStaff,
        type: "COMPLAINT_REOPENED",
        title: "Task Reopened",
        message: `Citizen reopened complaint ${complaint.complaintNumber}. Reason: ${reopenReason.trim()}`,
        complaintId: complaint._id,
        actorId: req.user._id
      });
    }
  } catch (notifErr) {
    console.error("[Complaint] Notification error (non-fatal):", notifErr.message);
  }

  res.status(200).json(
    new ApiResponse(200, { complaint }, "Complaint reopened and escalated to municipal administration.")
  );
});

/**
 * Citizen: Get dashboard summary counts and recent complaints
 */
export const getCitizenDashboard = asyncHandler(async (req, res) => {
  const citizenId = req.user._id;

  const total = await Complaint.countDocuments({ citizen: citizenId });
  const pending = await Complaint.countDocuments({
    citizen: citizenId,
    status: { $in: ["SUBMITTED", "UNDER_REVIEW"] }
  });
  const inProgress = await Complaint.countDocuments({
    citizen: citizenId,
    status: { $in: ["ASSIGNED", "IN_PROGRESS"] }
  });
  const resolved = await Complaint.countDocuments({
    citizen: citizenId,
    status: "RESOLVED"
  });
  const reopened = await Complaint.countDocuments({
    citizen: citizenId,
    status: "REOPENED"
  });

  const recentComplaints = await Complaint.find({ citizen: citizenId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("assignedStaff", "name department designation");

  const { Notification } = await import("../models/notifications.model.js");
  const recentNotifications = await Notification.find({ recipient: citizenId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          total,
          pending,
          inProgress,
          resolved,
          reopened
        },
        recentComplaints,
        recentNotifications
      },
      "Citizen dashboard data retrieved."
    )
  );
});
