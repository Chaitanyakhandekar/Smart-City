import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import ChatbotWidget from "../../components/ChatbotWidget";
import { notificationApi } from "../../api/client";
import { Bell, Check, Clock, ArrowRight, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const CitizenNotifications = () => {
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

  const handleMarkOne = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
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
                Civic Notifications
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time updates regarding your filed complaints and municipal actions
              </p>
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAll}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-blue-600" /> Mark All Read
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 flex justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Updates regarding your complaints will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                      !n.isRead ? "bg-blue-50/40" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          !n.isRead ? "bg-blue-600" : "bg-transparent"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
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
                      {n.complaint && (
                        <Link
                          to={`/citizen/complaints/${n.complaint._id || n.complaint}`}
                          onClick={() => handleMarkOne(n._id)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default CitizenNotifications;
