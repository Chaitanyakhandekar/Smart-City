import { Router } from "express";
import {
  getStaffDashboard,
  getStaffTasks,
  startWorkOnTask,
  resolveTask,
  uploadProgressUpdate
} from "../controllers/staff.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Only STAFF role
router.use(authenticate, authorizeRoles("STAFF"));

router.get("/dashboard", getStaffDashboard);
router.get("/tasks", getStaffTasks);
router.patch("/tasks/:id/start", upload.single("image"), startWorkOnTask);
router.patch("/tasks/:id/resolve", upload.single("image"), resolveTask);
router.post("/tasks/:id/progress", upload.single("image"), uploadProgressUpdate);

export default router;
