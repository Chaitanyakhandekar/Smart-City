import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { notificationApi } from "../../api/client";
import { Bell, Check, ArrowRight, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const AdminNotifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getMyNotifications();
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Administrative System Alerts
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                New submissions, reopened complaints, and escalations across all city zones
              </p>
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAll}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-purple-600" /> Mark All Read
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center text-purple-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No alerts recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                      !n.isRead ? "bg-purple-50/40" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          !n.isRead ? "bg-purple-600" : "bg-transparent"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dayjs(n.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">{n.message}</p>
                      </div>
                    </div>

                    {n.complaint && (
                      <Link
                        to={`/admin/complaints/${n.complaint._id || n.complaint}`}
                        className="px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-900 flex items-center gap-1 transition-colors flex-shrink-0"
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
    </div>
  );
};

export default AdminNotifications;
