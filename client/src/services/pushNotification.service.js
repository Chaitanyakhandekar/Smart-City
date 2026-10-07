import { notificationApi } from "../api/client";

/**
 * Utility to convert base64 VAPID public key to Uint8Array required by pushManager.subscribe
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Generate human-readable device name based on User-Agent
 */
export function getFriendlyDeviceName() {
  const ua = navigator.userAgent || "";
  let browser = "Browser";
  let os = "Device";

  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return `${browser} on ${os}${isStandalone ? " (PWA App)" : ""}`;
}

/**
 * Check if the browser supports Push Notifications and Service Workers
 */
export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Register the Service Worker.
 *
 * Uses navigator.serviceWorker.ready to ensure we always return
 * the ACTIVE (controlling) registration — not just any registered one.
 * This is critical: the push subscription MUST belong to the same
 * registration that handles push events in sw.js.
 */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported by this browser");
  }

  try {
    // Register our service worker (no-op if already registered at this URL)
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });

    // Always resolve with the READY (active) registration.
    // navigator.serviceWorker.ready waits until a service worker is
    // active and controlling the page — this is the same registration
    // that will receive push events.
    const registration = await navigator.serviceWorker.ready;

    console.log(
      "[PushService] Service Worker ready, scope:",
      registration.scope
    );

    return registration;
  } catch (error) {
    console.error("[PushService] Service Worker registration failed:", error);
    throw error;
  }
}

/**
 * Check if there is currently an active push subscription.
 * Always reads from navigator.serviceWorker.ready so the result
 * belongs to the correct (active) registration.
 */
export async function getActiveSubscription() {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn("[PushService] Failed to check active subscription:", err);
    return null;
  }
}

/**
 * Subscribe user to Web Push.
 *
 * Key invariant: pushManager.subscribe() is called on the SAME
 * registration that sw.js is active in. Using navigator.serviceWorker.ready
 * guarantees this — it returns the controlling registration, which is the
 * one that will receive future push events.
 */
export async function subscribeToPushNotifications(customDeviceName = null) {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported by your browser");
  }

  // 1. Request permission FIRST (must be done from a user gesture context)
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Push notifications were blocked. Please enable them in browser site settings."
        : "Push notification permission was not granted."
    );
  }

  // 2. Register SW and wait for it to be active
  //    This ensures the SAME SW registration handles push events.
  const registration = await registerServiceWorker();

  // 3. Obtain VAPID public key (env var preferred; fallback to API)
  let vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    try {
      const res = await notificationApi.getVapidPublicKey();
      vapidPublicKey = res.data?.data?.vapidPublicKey;
    } catch (err) {
      console.error("[PushService] Failed to fetch VAPID public key:", err);
    }
  }

  if (!vapidPublicKey) {
    throw new Error("VAPID public key not configured on server or client");
  }

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  // 4. Get existing subscription or create a fresh one
  //    Always use the same `registration` from navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    console.log("[PushService] No existing subscription — creating new one");
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    console.log("[PushService] New push subscription created:", subscription.endpoint.slice(0, 60) + "...");
  } else {
    console.log("[PushService] Reusing existing push subscription:", subscription.endpoint.slice(0, 60) + "...");
  }

  // 5. Send subscription details to backend for storage
  const deviceName = customDeviceName || getFriendlyDeviceName();
  await notificationApi.pushSubscribe(subscription, deviceName);
  console.log("[PushService] Push subscription saved to backend for device:", deviceName);

  return subscription;
}

/**
 * Unsubscribe current browser/device from Web Push
 */
export async function unsubscribeFromPushNotifications() {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;

      // Unsubscribe locally in browser first
      await subscription.unsubscribe();
      console.log("[PushService] Browser unsubscribed from push");

      // Then tell backend to remove from DB
      try {
        await notificationApi.pushUnsubscribe(endpoint);
        console.log("[PushService] Backend subscription removed");
      } catch (err) {
        console.warn("[PushService] Backend push unsubscribe failed:", err);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("[PushService] Failed to unsubscribe from push:", error);
    throw error;
  }
}

/**
 * Early SW registration — call this on app startup so the SW is
 * active before the user ever touches push settings.
 * Runs silently in the background; does NOT request permission.
 */
export async function earlyRegisterServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    // Don't await .ready here — this is fire-and-forget
    navigator.serviceWorker.ready.then((reg) => {
      console.log("[PushService] SW active and controlling, scope:", reg.scope);
    });
  } catch (err) {
    // Non-fatal — just log
    console.warn("[PushService] Early SW registration failed:", err.message);
  }
}
