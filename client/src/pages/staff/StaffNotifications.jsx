import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import PushNotificationBanner from "../../components/PushNotificationBanner";
import { useNotification } from "../../context/notificationContext";
import {
  Bell,
  Check,
  ArrowRight,
  Loader2,
  Clock,
  AlertTriangle,
  Briefcase,
  CheckCheck
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const StaffNotifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    socketConnected
  } = useNotification();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "COMPLAINT_RESOLVED":
      case "WORK_COMPLETED":
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      case "COMPLAINT_CRITICAL_ALERT":
      case "PRIORITY_CHANGED":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "STAFF_ASSIGNED":
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                  Staff Alerts & Assignments
                </h1>
                {socketConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                New task dispatches, field updates, and grievance escalations
              </p>
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-amber-600" /> Mark All Read
              </button>
            )}
          </div>

          {/* Web Push Subscription Banner */}
          <PushNotificationBanner />

          {/* Notifications Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading && notifications.length === 0 ? (
              <div className="py-16 flex justify-center text-amber-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No alerts recorded</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  New task dispatches, priority shifts, and citizen updates will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => {
                  const complaintId = n.complaint?._id || n.complaint;
                  return (
                    <div
                      key={n._id}
                      className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                        !n.isRead ? "bg-amber-50/40" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            !n.isRead ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {getNotificationIcon(n.type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-600" />
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">
                              {dayjs(n.createdAt).fromNow()}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">{n.message}</p>
                        </div>
                      </div>

                      {complaintId && (
                        <Link
                          to={`/staff/complaints/${complaintId}`}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 flex items-center gap-1 transition-colors flex-shrink-0"
                        >
                          Inspect Task <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default StaffNotifications;
