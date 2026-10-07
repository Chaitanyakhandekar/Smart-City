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
  AlertTriangle,
  FilePlus,
  RotateCcw,
  CheckCheck,
  Building2
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const AdminNotifications = () => {
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
      case "COMPLAINT_SUBMITTED":
        return <FilePlus className="w-4 h-4 text-purple-600" />;
      case "COMPLAINT_REOPENED":
        return <RotateCcw className="w-4 h-4 text-rose-600" />;
      case "COMPLAINT_CRITICAL_ALERT":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "COMPLAINT_RESOLVED":
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-200 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                Administrative System Alerts
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                New submissions, reopened complaints, and escalations across all city zones
              </p>
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAll}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-purple-400" /> Mark All Read
              </button>
            )}
          </div>

          <div className="bg-[#0F172A] rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center text-purple-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No alerts recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                      !n.isRead ? "bg-purple-950/20" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          !n.isRead ? "bg-purple-400 shadow-sm shadow-purple-400/50" : "bg-transparent"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100">{n.title}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dayjs(n.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1">{n.message}</p>
                      </div>

                    {n.complaint && (
                      <Link
                        to={`/admin/complaints/${n.complaint._id || n.complaint}`}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
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

export default AdminNotifications;
