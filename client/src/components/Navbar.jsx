import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContex";
import { notificationApi } from "../api/client";
import SmartCityLogo from "./SmartCityLogo";
import {
  Bell,
  LogOut,
  User,
  Shield,
  Briefcase,
  Check,
  Menu,
  X,
  ExternalLink
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const Navbar = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Fetch notifications periodically or on mount
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getMyNotifications();
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationApi.markAsRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setShowNotifications(false);

      if (notif.complaint) {
        const complaintId = notif.complaint._id || notif.complaint;
        if (role === "ADMIN") navigate(`/admin/complaints/${complaintId}`);
        else if (role === "STAFF") navigate(`/staff/complaints/${complaintId}`);
        else navigate(`/citizen/complaints/${complaintId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = () => {
    if (role === "ADMIN") {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
          <Shield className="w-3.5 h-3.5 text-teal-400" /> Admin Portal
        </span>
      );
    }
    if (role === "STAFF") {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Staff ({user?.department || "Field"})
        </span>
      );
    }
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        <User className="w-3.5 h-3.5 text-slate-400" /> Citizen
      </span>
    );
  };

  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      {/* Optional Civic Advisory Top Banner */}
      {showBanner && !user && (
        <div className="bg-slate-900 border-b border-teal-500/20 text-slate-200 text-xs py-2 px-4 relative z-40 transition-all flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-center w-full justify-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              CIVIC UPDATE
            </span>
            <span className="font-medium text-slate-300 hidden sm:inline">
              Smart City AI Vision triage is active 24/7 across all municipal zones.
            </span>
            <span className="font-medium text-slate-300 sm:hidden">
              AI Vision triage active 24/7.
            </span>
            <Link to="/citizen/report" className="underline font-bold text-teal-300 hover:text-teal-200 ml-1">
              File a report &rarr;
            </Link>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl transition-all text-white">
        <div className={`w-full px-4 sm:px-6 lg:px-8 ${!user ? "max-w-7xl mx-auto" : ""}`}>
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Hamburger + Brand */}
            <div className="flex items-center gap-3">
              {user && onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                  aria-label="Toggle Navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              <SmartCityLogo size="md" />

              {user && getRoleBadge()}
            </div>

            {/* Center Links (Shown for public/home view) */}
            {!user && (
              <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
                <Link to="/" className={`hover:text-teal-400 transition-colors ${location.pathname === "/" ? "text-teal-400 font-semibold" : ""}`}>
                  Home
                </Link>
                <Link to="/citizen/report" className="hover:text-teal-400 transition-colors">
                  Report Issue
                </Link>
                <Link to="/citizen/complaints" className="hover:text-teal-400 transition-colors">
                  Track Status
                </Link>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="hover:text-teal-400 transition-colors">
                  How It Works
                </a>
              </nav>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {user ? (
                <>
                  {/* In-App Notifications Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <>
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-75 pointer-events-none" />
                        </>
                      )}
                    </button>

                    {/* Notification Dropdown / Mobile Modal */}
                    {showNotifications && (
                      <>
                        <div
                          className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
                          onClick={() => setShowNotifications(false)}
                        />

                        <div
                          className={[
                            "bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50 text-slate-200",
                            "md:absolute md:right-0 md:mt-2 md:w-[380px]",
                            "fixed inset-x-0 mx-4 md:mx-0 md:inset-x-auto",
                            "top-[4.5rem] md:top-auto",
                            "max-w-[380px] md:max-w-none",
                            "w-[calc(100%-2rem)] md:w-[380px]",
                          ].join(" ")}
                          style={{
                            maxHeight: "calc(100vh - 5.5rem - 5rem - env(safe-area-inset-bottom, 0px))",
                          }}
                        >
                          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white">Notifications</h4>
                              {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && (
                                <button
                                  onClick={handleMarkAllRead}
                                  className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Mark all read
                                </button>
                              )}
                              <button
                                onClick={() => setShowNotifications(false)}
                                className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                aria-label="Close notifications"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="overflow-y-auto divide-y divide-slate-800 flex-1" style={{ maxHeight: "calc(100vh - 5.5rem - 5rem - 6.5rem - env(safe-area-inset-bottom, 0px))" }}>
                            {notifications.length === 0 ? (
                              <div className="py-8 text-center text-sm text-slate-400">
                                No notifications yet.
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n._id}
                                  onClick={() => handleNotificationClick(n)}
                                  className={`p-3.5 hover:bg-slate-800/70 cursor-pointer transition-colors ${
                                    !n.isRead ? "bg-teal-950/20" : ""
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-semibold text-white">{n.title}</p>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                      {dayjs(n.createdAt).fromNow()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center flex-shrink-0">
                            <Link
                              to={
                                role === "ADMIN"
                                  ? "/admin/notifications"
                                  : role === "STAFF"
                                  ? "/staff/notifications"
                                  : "/citizen/notifications"
                              }
                              onClick={() => setShowNotifications(false)}
                              className="text-xs font-medium text-teal-400 hover:underline"
                            >
                              View all notifications
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative" ref={userRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                      <img
                        src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                        alt={user?.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-slate-700"
                      />
                      <div className="hidden md:flex flex-col text-left">
                        <span className="text-sm font-semibold text-slate-200 max-w-[120px] truncate leading-tight">
                          {user?.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 capitalize">
                          {user?.role?.toLowerCase()}
                        </span>
                      </div>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 text-slate-200">
                        <div className="px-4 py-2.5 border-b border-slate-800">
                          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase border border-teal-500/30">
                            {user?.role}
                          </span>
                        </div>

                        <Link
                          to={
                            role === "ADMIN"
                              ? "/admin/profile"
                              : role === "STAFF"
                              ? "/staff/profile"
                              : "/citizen/profile"
                          }
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" /> My Profile
                        </Link>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            navigate("/login");
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-950/30 text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <Link
                    to="/login"
                    className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-md transition-all whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
