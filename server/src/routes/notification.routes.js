import { Router } from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getVapidPublicKey,
  pushSubscribe,
  pushUnsubscribe
} from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Public key endpoint (no auth required)
router.get("/vapid-public-key", getVapidPublicKey);

router.use(authenticate);

// Notification CRUD
router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

// Web Push (auth required)
router.post("/push/subscribe", pushSubscribe);
router.delete("/push/unsubscribe", pushUnsubscribe);

export default router;
