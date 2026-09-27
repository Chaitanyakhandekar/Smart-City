import { Router } from "express";
import { handleChatMessage } from "../controllers/chat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticate, handleChatMessage);

export default router;
