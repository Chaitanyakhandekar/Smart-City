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
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                Staff Alerts & Assignments
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                New task dispatches and grievance status escalations
              </p>
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAll}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-amber-400" /> Mark All Read
              </button>
            )}
          </div>

          <div className="bg-[#0F172A]/90 rounded-3xl border border-slate-800 shadow-md overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center text-amber-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No alerts recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                      !n.isRead ? "bg-amber-950/20" : "hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          !n.isRead ? "bg-amber-400" : "bg-transparent"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{n.title}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dayjs(n.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1">{n.message}</p>
                      </div>

                    {n.complaint && (
                      <Link
                        to={`/staff/tasks/${n.complaint._id || n.complaint}`}
                        className="px-3 py-1 rounded-lg bg-[#070B14] hover:bg-amber-950/40 text-xs font-bold text-amber-300 border border-slate-800 flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        Inspect Task <ArrowRight className="w-3 h-3 text-amber-400" />
                      </Link>
                    )}
                  </div>
                ))}
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
