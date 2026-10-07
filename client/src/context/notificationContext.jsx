import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContex";
import { notificationApi, SERVER_ROOT } from "../api/client";
import {
  isPushSupported as checkPushSupported,
  getNotificationPermission,
  getActiveSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from "../services/pushNotification.service";

export const NotificationContext = createContext(null);

// Gentle synthesized chime using Web Audio API (no external sound file required)
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15); // D6

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio autoplay might be blocked before first user interaction
  }
}

export const NotificationProvider = ({ children }) => {
  const { user, token, role } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  // Push notification states
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushPermission, setPushPermission] = useState("default");

  // Keep latest role and navigate in refs for stable listeners
  const roleRef = useRef(role);
  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Check Web Push support and existing status on mount
  useEffect(() => {
    const supported = checkPushSupported();
    setPushSupported(supported);
    if (supported) {
      setPushPermission(getNotificationPermission());
      getActiveSubscription().then((sub) => {
        setPushSubscribed(!!sub);
      });
    }
  }, [user]);

  // Initial fetch of unread count and recent notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await notificationApi.getMyNotifications({ limit: 30 });
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("[NotificationContext] Failed to fetch notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationApi.getUnreadCount();
      if (typeof res.data?.data?.unreadCount === "number") {
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err) {
      console.warn("[NotificationContext] Failed to fetch unread count:", err.message);
    }
  }, [token]);

  // Fetch initial notifications when token is available
  useEffect(() => {
    if (token && user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, user, fetchNotifications]);

  // ==========================================
  // SOCKET.IO LIFECYCLE MANAGEMENT
  // ==========================================
  useEffect(() => {
    if (!token || !user) {
      setSocket((prev) => {
        if (prev) {
          prev.disconnect();
        }
        return null;
      });
      setSocketConnected(false);
      return;
    }

    const socketUrl = SERVER_ROOT || "http://localhost:3000";
    console.log(`[Socket.IO] Connecting to URL: ${socketUrl}`);

    const newSocket = io(socketUrl, {
      withCredentials: true,
      auth: {
        token
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    newSocket.on("connect", () => {
      const currentUserId = userRef.current?._id || user._id;
      console.log(`Socket connected: ${newSocket.id}, user: ${currentUserId}`);
      console.log(`Joined room: user:${currentUserId}`);
      setSocketConnected(true);

      // Re-sync notifications when socket reconnects
      fetchNotifications();
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Disconnected: ${reason}`);
      setSocketConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.warn(`[Socket.IO] Connection error: ${err.message}`);
      setSocketConnected(false);
    });

    setSocket(newSocket);

    return () => {
      console.log(`[Socket.IO] Cleaning up connection for socket: ${newSocket.id}`);
      newSocket.disconnect();
      setSocket(null);
      setSocketConnected(false);
    };
  }, [token, user?._id, fetchNotifications]);

  // ==========================================
  // SINGLE PERSISTENT REAL-TIME EVENT LISTENER
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (newNotification) => {
      console.log("REAL-TIME NOTIFICATION RECEIVED:", newNotification);

      // Play audio chime
      playNotificationChime();

      // Update notifications list state
      setNotifications((prev) => {
        if (prev.some((n) => n._id === newNotification._id)) return prev;
        return [newNotification, ...prev];
      });

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show real-time interactive toast
      const currentRole = roleRef.current;
      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              if (newNotification.complaint) {
                const complaintId =
                  newNotification.complaint._id || newNotification.complaint;
                if (currentRole === "ADMIN") navigate(`/admin/complaints/${complaintId}`);
                else if (currentRole === "STAFF") navigate(`/staff/complaints/${complaintId}`);
                else navigate(`/citizen/complaints/${complaintId}`);
              } else {
                if (currentRole === "ADMIN") navigate("/admin/notifications");
                else if (currentRole === "STAFF") navigate("/staff/notifications");
                else navigate("/citizen/notifications");
              }
            }}
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto border border-blue-100 flex p-3.5 cursor-pointer hover:bg-slate-50 transition-all`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                  {newNotification.title || "SmartCity Update"}
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                {newNotification.message}
              </p>
              <p className="mt-1.5 text-[10px] text-blue-600 font-semibold">
                Tap to view details &rarr;
              </p>
            </div>
          </div>
        ),
        { duration: 5000, id: `notif-${newNotification._id}` }
      );
    };

    const handleRead = ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleReadAll = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    };

    socket.on("notification:new", handleNotification);
    socket.on("notification:read", handleRead);
    socket.on("notification:read_all", handleReadAll);

    return () => {
      socket.off("notification:new", handleNotification);
      socket.off("notification:read", handleRead);
      socket.off("notification:read_all", handleReadAll);
    };
  }, [socket, navigate]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[NotificationContext] Failed to mark as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("[NotificationContext] Failed to mark all as read:", err);
      toast.error("Failed to mark notifications as read");
    }
  };

  // Enable Web Push notifications
  const enablePushNotifications = async () => {
    try {
      await subscribeToPushNotifications();
      setPushSubscribed(true);
      setPushPermission("granted");
      toast.success("Phone / browser push notifications enabled!");
      return true;
    } catch (err) {
      const msg = err.message || "Failed to enable push notifications";
      toast.error(msg);
      setPushPermission(getNotificationPermission());
      return false;
    }
  };

  // Disable Web Push notifications
  const disablePushNotifications = async () => {
    try {
      await unsubscribeFromPushNotifications();
      setPushSubscribed(false);
      toast.success("Push notifications disabled for this device.");
      return true;
    } catch (err) {
      console.error("[NotificationContext] Failed to unsubscribe:", err);
      toast.error("Failed to disable push notifications");
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        socketConnected,
        pushSupported,
        pushSubscribed,
        pushPermission,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        enablePushNotifications,
        disablePushNotifications,
        socket
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationContext;
