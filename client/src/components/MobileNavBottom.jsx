import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContex";
import { useNotification } from "../context/notificationContext";
import {
  Home,
  FileText,
  Bell,
  User,
  PlusCircle,
  Users,
  BarChart3,
  MoreHorizontal,
  X,
  LogOut,
  Shield
} from "lucide-react";

export const MobileNavBottom = () => {
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    setShowMore(false);
    logout();
    navigate("/login");
  };

  if (role === "ADMIN") {
    return (
      <>
        {showMore && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in"
            onClick={() => setShowMore(false)}
          >
            <div
              className="bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Admin Navigation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMore(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <NavLink
                  to="/admin/notifications"
                  onClick={() => setShowMore(false)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 flex items-center justify-between font-semibold text-slate-700 hover:text-blue-700"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" /> Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/admin/profile"
                  onClick={() => setShowMore(false)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-700"
                >
                  <User className="w-4 h-4 text-blue-600" /> My Profile
                </NavLink>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center gap-2 text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}

        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg"
          aria-label="Mobile Navigation"
        >
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </NavLink>

          <NavLink
            to="/admin/complaints"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
              }`
            }
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Complaints</span>
          </NavLink>

          <NavLink
            to="/admin/staff"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
              }`
            }
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Staff</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
              }`
            }
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Analytics</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>
      </>
    );
  }

  if (role === "STAFF") {
    return (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg"
        aria-label="Mobile Navigation"
      >
        <NavLink
          to="/staff/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        <NavLink
          to="/staff/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Tasks</span>
        </NavLink>

        <NavLink
          to="/staff/notifications"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
            }`
          }
        >
          <div className="relative">
            <Bell className="w-5 h-5 mb-0.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Alerts</span>
        </NavLink>

        <NavLink
          to="/staff/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Profile</span>
        </NavLink>
      </nav>
    );
  }

  // CITIZEN ROLE
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg"
      aria-label="Mobile Navigation"
    >
      <NavLink
        to="/citizen/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </NavLink>

      <NavLink
        to="/citizen/complaints"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
          }`
        }
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Complaints</span>
      </NavLink>

      <NavLink
        to="/citizen/report"
        className="flex flex-col items-center justify-center flex-1 py-1 text-blue-600"
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 -mt-5">
          <PlusCircle className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-blue-600 tracking-tight mt-0.5">Report</span>
      </NavLink>

      <NavLink
        to="/citizen/notifications"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
          }`
        }
      >
        <div className="relative">
          <Bell className="w-5 h-5 mb-0.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Alerts</span>
      </NavLink>

      <NavLink
        to="/citizen/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-medium"
          }`
        }
      >
        <User className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileNavBottom;
