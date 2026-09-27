import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContex";
import SmartCityLogo from "./SmartCityLogo";
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  Bell,
  User,
  Users,
  BarChart3,
  CheckSquare,
  LogOut,
  ChevronRight,
  HelpCircle,
  FileText
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const getNavigationLinks = () => {
    if (role === "ADMIN") {
      return [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Complaints", path: "/admin/complaints", icon: ListOrdered },
        { name: "Staff Management", path: "/admin/staff", icon: Users },
        { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
        { name: "Notifications", path: "/admin/notifications", icon: Bell },
        { name: "Profile", path: "/admin/profile", icon: User }
      ];
    }

    if (role === "STAFF") {
      return [
        { name: "Dashboard", path: "/staff/dashboard", icon: LayoutDashboard },
        { name: "Assigned Tasks", path: "/staff/tasks", icon: CheckSquare },
        { name: "Work Alerts", path: "/staff/notifications", icon: Bell },
        { name: "Staff Profile", path: "/staff/profile", icon: User }
      ];
    }

    // Citizen Links matching reference design
    return [
      { name: "Dashboard", path: "/citizen/dashboard", icon: LayoutDashboard },
      { name: "My Complaints", path: "/citizen/complaints", icon: FileText },
      { name: "New Complaint", path: "/citizen/report", icon: PlusCircle, highlight: true },
      { name: "Notifications", path: "/citizen/notifications", icon: Bell },
      { name: "Profile", path: "/citizen/profile", icon: User }
    ];
  };

  const navLinks = getNavigationLinks();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-[#0F172A] text-slate-300 z-40 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between border-r border-slate-800 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 p-4 overflow-y-auto">
          {/* Header section in sidebar */}
          <div className="px-3 py-3 mb-2 flex items-center justify-between border-b border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {role === "ADMIN" ? "Admin Console" : role === "STAFF" ? `${user?.department || "Field"} Staff` : "Citizen Portal"}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20"
                        : link.highlight
                        ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 hover:text-white"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {/* User quick card */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-white truncate text-xs">
                {user?.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.role} • {user?.department || "Civic"}
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

