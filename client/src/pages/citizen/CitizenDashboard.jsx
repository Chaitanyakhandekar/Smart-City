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
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          {/* Top Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Citizen Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
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
                  className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Citizen Avatar & Name pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#0F172A] border border-slate-800 rounded-xl shadow-xs flex-shrink-0">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-200 leading-none">{user?.name || "Citizen"}</p>
                  <p className="text-[10px] text-teal-400 leading-none mt-1">Verified Citizen</p>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE WELCOME HERO & QUICK CATEGORIES */}
          <div className="md:hidden space-y-4">
            <div className="bg-[#0F172A] rounded-2xl p-5 border border-slate-800 shadow-xl">
              <h2 className="text-lg font-extrabold text-white">
                Hello, <br />
                <span className="text-teal-400">Welcome to Smart City</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Report, Track and Make a Difference
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <Link
                  to="/citizen/report"
                  className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold text-xs text-center shadow-sm"
                >
                  Report Complaint
                </Link>
                <Link
                  to="/citizen/complaints"
                  className="px-3 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-semibold text-xs text-center border border-slate-800"
                >
                  Track Complaint
                </Link>
              </div>
            </div>

            {/* Quick Categories Grid on Mobile */}
            <div className="bg-[#0F172A] rounded-2xl p-4 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white">Quick Categories</span>
                <Link to="/citizen/report" className="text-[11px] font-semibold text-teal-400 hover:underline">
                  See All
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center mb-1">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300">Roads</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300">Garbage</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-1">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300">Drainage</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-1">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300">Water Leak</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center mb-1">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300">Streetlight</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-center transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center mb-1">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-300">Property</span>
                </Link>
              </div>
            </div>
          </div>

          {/* DESKTOP WELCOME CALLOUT */}
          <div className="hidden md:flex items-center justify-between p-6 bg-gradient-to-r from-slate-900 via-teal-950/80 to-slate-900 border border-teal-500/20 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full filter blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-xs font-semibold mb-2 backdrop-blur-xs border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Citizen Governance Workspace</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Track real-time progress on your reported neighborhood issues, inspect on-site photographic proof, or file a new grievance.
              </p>
            </div>
            <Link
              to="/citizen/report"
              className="relative z-10 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              Report Issue Now
            </Link>
          </div>

          {/* 4 STATS OVERVIEW CARDS STRIP (SOOTHING DARK SLATE) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Complaints */}
            <div className="bg-[#0F172A] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</span>
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{data.stats.total}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Lifetime submitted</span>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-[#0F172A] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Crews</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{data.stats.inProgress}</span>
                <span className="text-[11px] text-amber-500/80 font-medium block mt-0.5">Work in progress</span>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-[#0F172A] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{data.stats.resolved}</span>
                <span className="text-[11px] text-emerald-500/80 font-medium block mt-0.5">Photographically verified</span>
              </div>
            </div>

            {/* Pending / Reopened */}
            <div className="bg-[#0F172A] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Triage</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-200">
                  {data.stats.pending || data.stats.reopened || 0}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Awaiting dispatch</span>
              </div>
            </div>
          </div>

          {/* MY COMPLAINTS SECTION */}
          <div className="bg-[#0F172A] rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">My Complaints</h3>
                <p className="text-xs text-slate-400">Track resolution progress, field proofs, and milestones</p>
              </div>

              {/* Status Chips Filter Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("ALL")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "ALL"
                      ? "bg-teal-500 text-slate-950 font-bold border-teal-500 shadow-sm"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <span>All</span>
                  <span className={`font-extrabold px-1.5 py-0.2 rounded-md ${selectedStatusTab === "ALL" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                    {data.stats.total}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("IN_PROGRESS")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "IN_PROGRESS"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>In Progress</span>
                  <span className="font-extrabold">{data.stats.inProgress}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("RESOLVED")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "RESOLVED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolved</span>
                  <span className="font-extrabold">{data.stats.resolved}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatusTab("REOPENED")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedStatusTab === "REOPENED"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopened</span>
                  <span className="font-extrabold">{data.stats.reopened || 0}</span>
                </button>
              </div>
            </div>

            {/* Complaint Cards List */}
            {loading ? (
              <div className="py-16 flex justify-center text-teal-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-14 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">No complaints matching current filter</p>
                <p className="text-xs text-slate-500 mt-1">Submit a new complaint or try clearing your search query.</p>
                <Link
                  to="/citizen/report"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:underline"
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
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-teal-500/40 hover:bg-slate-850 transition-all gap-3.5"
                    >
                      {/* Left: Thumbnail + Complaint Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={c.title}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <span className="font-mono text-[11px] font-bold text-slate-400">
                            #{c.complaintNumber}
                          </span>
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                            {c.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            {c.locationAddress || "Civic location"}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status badge, Date, and chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex-shrink-0">
                        <StatusBadge status={c.status} size="sm" />
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {dayjs(c.createdAt).format("DD MMM YYYY")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
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
