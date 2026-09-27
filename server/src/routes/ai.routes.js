import { Router } from "express";
import { analyzeCivicIssue } from "../controllers/ai.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/analyze", authenticate, upload.single("image"), analyzeCivicIssue);

export default router;
