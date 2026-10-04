import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContex";
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
            className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in"
            onClick={() => setShowMore(false)}
          >
            <div
              className="bg-[#0F172A] rounded-t-3xl p-5 border-t border-slate-800 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Admin Navigation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMore(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <NavLink
                  to="/admin/notifications"
                  onClick={() => setShowMore(false)}
                  className="p-3 rounded-xl bg-[#070B14] hover:bg-purple-950/30 border border-slate-800 flex items-center gap-2 font-semibold text-slate-300 hover:text-purple-300 transition-colors"
                >
                  <Bell className="w-4 h-4 text-purple-400" /> Notifications
                </NavLink>
                <NavLink
                  to="/admin/profile"
                  onClick={() => setShowMore(false)}
                  className="p-3 rounded-xl bg-[#070B14] hover:bg-purple-950/30 border border-slate-800 flex items-center gap-2 font-semibold text-slate-300 hover:text-purple-300 transition-colors"
                >
                  <User className="w-4 h-4 text-purple-400" /> My Profile
                </NavLink>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-3 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 text-xs font-bold hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}

        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-800 z-40 flex items-center justify-around px-2 shadow-2xl"
          aria-label="Mobile Navigation"
        >
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-purple-400 font-bold" : "text-slate-400 hover:text-white font-medium"
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </NavLink>

          <NavLink
            to="/admin/complaints"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-purple-400 font-bold" : "text-slate-400 hover:text-white font-medium"
              }`
            }
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Complaints</span>
          </NavLink>

          <NavLink
            to="/admin/staff"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-purple-400 font-bold" : "text-slate-400 hover:text-white font-medium"
              }`
            }
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Staff</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-purple-400 font-bold" : "text-slate-400 hover:text-white font-medium"
              }`
            }
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Analytics</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white font-medium transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>
      </>
    );
  }

  if (role === "STAFF") {
    return (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-800 z-40 flex items-center justify-around px-2 shadow-2xl"
        aria-label="Mobile Navigation"
      >
        <NavLink
          to="/staff/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white font-medium"
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        <NavLink
          to="/staff/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white font-medium"
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Tasks</span>
        </NavLink>

        <NavLink
          to="/staff/notifications"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white font-medium"
            }`
          }
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Alerts</span>
        </NavLink>

        <NavLink
          to="/staff/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white font-medium"
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
      className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-800 z-40 flex items-center justify-around px-2 shadow-2xl"
      aria-label="Mobile Navigation"
    >
      <NavLink
        to="/citizen/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-teal-400 font-bold" : "text-slate-400 hover:text-white font-medium"
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </NavLink>

      <NavLink
        to="/citizen/complaints"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-teal-400 font-bold" : "text-slate-400 hover:text-white font-medium"
          }`
        }
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Complaints</span>
      </NavLink>

      <NavLink
        to="/citizen/report"
        className="flex flex-col items-center justify-center flex-1 py-1"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/30 -mt-5 font-bold hover:scale-105 transition-transform">
          <PlusCircle className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-teal-400 tracking-tight mt-0.5">Report</span>
      </NavLink>

      <NavLink
        to="/citizen/notifications"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-teal-400 font-bold" : "text-slate-400 hover:text-white font-medium"
          }`
        }
      >
        <Bell className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Alerts</span>
      </NavLink>

      <NavLink
        to="/citizen/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? "text-teal-400 font-bold" : "text-slate-400 hover:text-white font-medium"
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
