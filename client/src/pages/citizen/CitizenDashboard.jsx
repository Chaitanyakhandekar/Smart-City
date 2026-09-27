import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContex";
import { complaintApi, getImageUrl } from "../../api/client";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import ChatbotWidget from "../../components/ChatbotWidget";
import {
  PlusCircle,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Loader2,
  Calendar,
  MapPin,
  Search,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  Trash2,
  Droplets,
  Lightbulb,
  Building,
  Image as ImageIcon
} from "lucide-react";
import dayjs from "dayjs";

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("ALL");
  const [data, setData] = useState({
    stats: { total: 0, pending: 0, inProgress: 0, resolved: 0, reopened: 0 },
    recentComplaints: [],
    recentNotifications: []
  });

  const fetchDashboard = async (isManual = false) => {
    try {
      if (!data.recentComplaints.length) setLoading(true);

      const res = await complaintApi.getCitizenDashboard();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter complaints client-side by search query and optional status tab
  const filteredComplaints = useMemo(() => {
    let list = data.recentComplaints || [];
    if (selectedStatusTab !== "ALL") {
      list = list.filter((c) => {
        if (selectedStatusTab === "IN_PROGRESS") return c.status === "IN_PROGRESS" || c.status === "ASSIGNED";
        if (selectedStatusTab === "RESOLVED") return c.status === "RESOLVED";
        if (selectedStatusTab === "REOPENED") return c.status === "REOPENED";
        if (selectedStatusTab === "PENDING") return c.status === "SUBMITTED" || c.status === "UNDER_REVIEW";
        return true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.complaintNumber?.toLowerCase().includes(q) ||
          c.locationAddress?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data.recentComplaints, searchQuery, selectedStatusTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          {/* Top Header Bar matching reference design: Greeting / Title + Search + Citizen profile */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Citizen Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of your reported civic issues and real-time municipal updates
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search complaints input */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search complaints..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Citizen Avatar & Name pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs flex-shrink-0">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || "Citizen"}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">Citizen</p>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE WELCOME HERO & QUICK CATEGORIES (Matching Reference Mobile Design) */}
          <div className="md:hidden space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-extrabold text-slate-900">
                Hello, <br />
                <span className="text-blue-600">Welcome to Smart City</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Report, Track and Make a Difference
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <Link
                  to="/citizen/report"
                  className="px-3 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs text-center shadow-sm"
                >
                  Report a Complaint
                </Link>
                <Link
                  to="/citizen/complaints"
                  className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs text-center border border-slate-200"
                >
                  Track Complaint
                </Link>
              </div>
            </div>

            {/* Quick Categories Grid on Mobile */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800">Quick Categories</span>
                <Link to="/citizen/report" className="text-[11px] font-semibold text-blue-600 hover:underline">
                  See All
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700">Roads</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700">Garbage</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50/50 border border-slate-100 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center mb-1">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700">Drainage</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700">Water Leak</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700">Streetlight</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-100 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-1">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700">Property</span>
                </Link>
              </div>
            </div>
          </div>

          {/* DESKTOP WELCOME CALLOUT */}
          <div className="hidden md:flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl text-white shadow-md">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Citizen Portal
              </span>
              <h2 className="text-2xl font-extrabold mt-1">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                Notice an issue in your neighborhood? Report damaged roads, overflowing waste, or water pipeline leaks for rapid AI-assisted municipal resolution.
              </p>
            </div>
            <Link
              to="/citizen/report"
              className="px-6 py-3 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Report Issue Now
            </Link>
          </div>

          {/* MY COMPLAINTS SECTION (Matching the reference design center card) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">My Complaints</h3>
                <p className="text-xs text-slate-400">Track resolution progress and field proofs</p>
              </div>

              {/* Status Chips Filter Bar matching reference design: [Total: 12] [In Progress: 4] [Resolved: 7] [Reopened: 1] */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "ALL"
                      ? "bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-100"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total</span>
                  <span className="font-extrabold">{data.stats.total}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("IN_PROGRESS")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "IN_PROGRESS"
                      ? "bg-amber-50 text-amber-800 border-amber-200 ring-2 ring-amber-100"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>In Progress</span>
                  <span className="font-extrabold">{data.stats.inProgress}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("RESOLVED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "RESOLVED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 ring-2 ring-emerald-100"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resolved</span>
                  <span className="font-extrabold">{data.stats.resolved}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("REOPENED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "REOPENED"
                      ? "bg-rose-50 text-rose-800 border-rose-200 ring-2 ring-rose-100"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reopened</span>
                  <span className="font-extrabold">{data.stats.reopened || 0}</span>
                </button>
              </div>
            </div>

            {/* Complaint Cards List (Matching reference design format: Thumbnail on left, ID/Title/Location in center, Status/Date/Arrow on right) */}
            {loading ? (
              <div className="py-16 flex justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-14 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No complaints matching current filter</p>
                <p className="text-xs text-slate-400 mt-1">Submit a new complaint or try clearing your search query.</p>
                <Link
                  to="/citizen/report"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> File a new complaint
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredComplaints.map((c) => {
                  const thumb = c.beforeImage ? getImageUrl(c.beforeImage) : null;
                  return (
                    <Link
                      key={c._id}
                      to={`/citizen/complaints/${c._id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 hover:shadow-sm transition-all gap-3.5"
                    >
                      {/* Left: Thumbnail + Complaint Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={c.title}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className="font-mono text-[11px] font-bold text-slate-500">
                            #{c.complaintNumber}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {c.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            {c.locationAddress || "Civic location"}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status badge, Date, and chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
                        <StatusBadge status={c.status} size="sm" />
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {dayjs(c.createdAt).format("DD MMM YYYY")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
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

export default CitizenDashboard;
