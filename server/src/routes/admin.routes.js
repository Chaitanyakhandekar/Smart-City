import { Router } from "express";
import {
  getAdminDashboard,
  getAllComplaints,
  updateComplaint,
  assignStaff,
  rejectComplaint,
  getStaffList,
  createStaff,
  toggleStaffStatus
} from "../controllers/admin.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Strictly ADMIN role only
router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/dashboard", getAdminDashboard);
router.get("/complaints", getAllComplaints);
router.patch("/complaints/:id", updateComplaint);
router.post("/complaints/:id/assign", assignStaff);
router.post("/complaints/:id/reject", rejectComplaint);

// Staff management
router.get("/staff", getStaffList);
router.post("/staff", createStaff);
router.patch("/staff/:id/status", toggleStaffStatus);

export default router;
