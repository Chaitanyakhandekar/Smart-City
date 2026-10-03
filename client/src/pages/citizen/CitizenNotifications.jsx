import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import ChatbotWidget from "../../components/ChatbotWidget";
import PushNotificationBanner from "../../components/PushNotificationBanner";
import { useNotification } from "../../context/notificationContext";
import {
  Bell,
  Check,
  ArrowRight,
  Loader2,
  CheckCheck,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const CitizenNotifications = () => {
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
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case "NEW_COMMENT":
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case "WORK_IN_PROGRESS":
      case "STAFF_ASSIGNED":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Civic Notifications
                </h1>
                {socketConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Real-time updates regarding your filed complaints and municipal actions
              </p>
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-blue-600" /> Mark All Read
              </button>
            )}
          </div>

          {/* Web Push Subscription Banner */}
          <PushNotificationBanner />

          {/* Notifications Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading && notifications.length === 0 ? (
              <div className="py-16 flex justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Updates regarding your complaints, assignments, and resolution progress will appear here in real time.
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
                        !n.isRead ? "bg-blue-50/40" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            !n.isRead ? "bg-blue-100/80" : "bg-slate-100"
                          }`}
                        >
                          {getNotificationIcon(n.type)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {n.title}
                            </h4>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">
                              {dayjs(n.createdAt).fromNow()}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {complaintId && (
                          <Link
                            to={`/citizen/complaints/${complaintId}`}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n._id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                          >
                            View <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <ChatbotWidget />
      <MobileNavBottom />
    </div>
  );
};

export default CitizenNotifications;
