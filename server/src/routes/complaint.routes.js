import { Router } from "express";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  confirmResolution,
  reopenComplaint,
  getCitizenDashboard
} from "../controllers/complaint.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(authenticate);

// Citizen Routes
router.post("/", authorizeRoles("CITIZEN"), upload.single("image"), createComplaint);
router.get("/my", authorizeRoles("CITIZEN"), getMyComplaints);
router.get("/dashboard", authorizeRoles("CITIZEN"), getCitizenDashboard);

// Details viewable by Citizen, Staff, Admin
router.get("/:id", getComplaintById);

// Resolution confirmation and reopening
router.post("/:id/confirm", authorizeRoles("CITIZEN"), confirmResolution);
router.post("/:id/reopen", authorizeRoles("CITIZEN"), reopenComplaint);

export default router;
