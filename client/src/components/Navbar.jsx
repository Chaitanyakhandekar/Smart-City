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
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Shield className="w-3.5 h-3.5 text-blue-600" /> Admin Portal
        </span>
      );
    }
    if (role === "STAFF") {
      return (
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Briefcase className="w-3.5 h-3.5 text-amber-600" /> Staff ({user?.department || "Field"})
        </span>
      );
    }
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <User className="w-3.5 h-3.5 text-slate-500" /> Citizen
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className={`w-full px-4 sm:px-6 lg:px-8 ${!user ? "max-w-7xl mx-auto" : ""}`}>
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3">
            {user && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
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
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link to="/" className={`hover:text-blue-600 transition-colors ${location.pathname === "/" ? "text-blue-600 font-semibold" : ""}`}>
                Home
              </Link>
              <Link to="/citizen/report" className="hover:text-blue-600 transition-colors">
                Report
              </Link>
              <Link to="/citizen/complaints" className="hover:text-blue-600 transition-colors">
                Track
              </Link>
              <a href="#about" className="hover:text-blue-600 transition-colors">
                About
              </a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">
                Contact
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
                    className="relative p-2.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-sm text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.isRead ? "bg-blue-50/40" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {dayjs(n.createdAt).fromNow()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                        <Link
                          to={
                            role === "ADMIN"
                              ? "/admin/notifications"
                              : role === "STAFF"
                              ? "/staff/notifications"
                              : "/citizen/notifications"
                          }
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={user?.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-slate-200"
                    />
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate leading-tight">
                        {user?.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 capitalize">
                        {user?.role?.toLowerCase()}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
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
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

