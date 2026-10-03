import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:smartcity@example.com";

// Only configure web-push if VAPID keys are present
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  console.log("[WebPush] VAPID keys configured successfully");
} else {
  console.warn("[WebPush] VAPID keys not configured — push notifications disabled. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env");
}

export { webpush, vapidPublicKey };
export default webpush;
