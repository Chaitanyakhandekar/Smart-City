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
 * Register the Service Worker (if not already registered)
 */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported by this browser");
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error("[PushService] Service Worker registration failed:", error);
    throw error;
  }
}

/**
 * Check if there is currently an active push subscription
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
 * Subscribe user to Web Push
 */
export async function subscribeToPushNotifications(customDeviceName = null) {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported by your browser");
  }

  // 1. Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Push notifications were blocked. Please enable them in browser site settings."
        : "Push notification permission was not granted."
    );
  }

  // 2. Ensure Service Worker is registered
  const registration = await registerServiceWorker();

  // 3. Obtain VAPID public key
  let vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    try {
      const res = await notificationApi.getVapidPublicKey();
      vapidPublicKey = res.data?.data?.vapidPublicKey;
    } catch (err) {
      console.error("[PushService] Failed to fetch VAPID public key from backend:", err);
    }
  }

  if (!vapidPublicKey) {
    throw new Error("VAPID public key not configured on server or client");
  }

  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  // 4. Check existing subscription or create new
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });
  }

  // 5. Send subscription to server
  const deviceName = customDeviceName || getFriendlyDeviceName();
  await notificationApi.pushSubscribe(subscription, deviceName);

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
      // Unsubscribe locally in browser
      await subscription.unsubscribe();

      // Tell backend to delete from DB
      try {
        await notificationApi.pushUnsubscribe(endpoint);
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
