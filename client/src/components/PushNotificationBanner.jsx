import React, { useState } from "react";
import { useNotification } from "../context/notificationContext";
import { Bell, BellRing, BellOff, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export const PushNotificationBanner = ({ className = "" }) => {
  const {
    pushSupported,
    pushSubscribed,
    pushPermission,
    enablePushNotifications,
    disablePushNotifications
  } = useNotification();

  const [loading, setLoading] = useState(false);

  if (!pushSupported) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    try {
      await enablePushNotifications();
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await disablePushNotifications();
    } finally {
      setLoading(false);
    }
  };

  // Browser has blocked notifications
  if (pushPermission === "denied") {
    return (
      <div
        className={`p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 ${className}`}
      >
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-900">
            Push Notifications Blocked
          </h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Your browser has blocked push notifications for SmartCity. To receive live alerts on your device, click the lock/settings icon in your browser URL bar and change <strong>Notifications</strong> to <strong>Allow</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Already subscribed
  if (pushSubscribed) {
    return (
      <div
        className={`p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-emerald-950">
                Push Notifications Active
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                Connected
              </span>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              This device receives instant alerts even when the browser or app is closed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDisable}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-100/60 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <BellOff className="w-3.5 h-3.5 text-emerald-700" />
          )}
          Turn Off on this Device
        </button>
      </div>
    );
  }

  // Not subscribed yet
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center flex-shrink-0 ring-1 ring-white/20">
          <BellRing className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Enable Live Device Push Notifications
          </h4>
          <p className="text-xs text-blue-100 mt-0.5 max-w-xl leading-relaxed">
            Get instant phone and desktop alerts when complaints are assigned, status updates occur, or work progress is posted.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
        ) : (
          <Bell className="w-4 h-4 text-blue-700" />
        )}
        Enable Notifications
      </button>
    </div>
  );
};

export default PushNotificationBanner;
