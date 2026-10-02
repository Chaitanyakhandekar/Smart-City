import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import { adminApi } from "../../api/client";
import {
  Shield,
  Layers,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Users,
  BarChart2,
  ArrowRight,
  Loader2,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronRight,
  Trash2,
  Droplets,
  Lightbulb,
  Building,
  MapPin,
  TrendingUp
} from "lucide-react";
import dayjs from "dayjs";

export const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("Last 30 days");
  const [data, setData] = useState({
    stats: {
      total: 0,
      submitted: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      reopened: 0,
      highPriority: 0,
      totalStaff: 0,
      totalCitizens: 0
    },
    categoryData: [],
    statusData: [],
    priorityData: [],
    recentComplaints: []
  });

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!data?.recentComplaints?.length) setLoading(true);
      setError(null);

      const res = await adminApi.getDashboard();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => {
      fetchDashboard();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute donut slices from real categoryData defensively
  const totalCategoryComplaints = (data?.categoryData || []).reduce((acc, curr) => acc + (curr?.value || 0), 0) || (data?.stats?.total || 1);
  const categoryColors = {
    "Roads": "#3B82F6",
    "Waste Management": "#10B981",
    "Drainage": "#06B6D4",
    "Water Supply": "#6366F1",
    "Street Infrastructure": "#F59E0B",
    "Public Property": "#EF4444",
    "Other": "#94A3B8"
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Roads": return <Layers className="w-3.5 h-3.5 text-blue-600" />;
      case "Waste Management": return <Trash2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "Drainage": return <Droplets className="w-3.5 h-3.5 text-sky-600" />;
      case "Water Supply": return <Droplets className="w-3.5 h-3.5 text-indigo-600" />;
      case "Street Infrastructure": return <Lightbulb className="w-3.5 h-3.5 text-amber-600" />;
      case "Public Property": return <Building className="w-3.5 h-3.5 text-rose-600" />;
      default: return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          {/* Top Header Bar matching reference: Dashboard title + Last 30 days selector + Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Municipal operations overview and real-time grievance metrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Filter selector matching reference */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{timeRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-xs transition-colors"
                title="Refresh live data"
              >
                <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              <Link
                to="/admin/complaints"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all"
              >
                Manage Complaints
              </Link>
            </div>
          </div>

          {/* Error Banner if API failed */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* 4 STAT CARDS MATCHING REFERENCE DESIGN */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            <StatCard
              title="Total Complaints"
              value={data?.stats?.total ?? 0}
              trend="12%"
              icon={Layers}
              color="blue"
              subtitle="Registered civic records"
            />
            <StatCard
              title="Resolved"
              value={data?.stats?.resolved ?? 0}
              trend="18%"
              icon={CheckCircle2}
              color="emerald"
              subtitle="Closed with verified proof"
            />
            <StatCard
              title="In Progress"
              value={data?.stats?.inProgress ?? 0}
              trend="5%"
              icon={Wrench}
              color="amber"
              subtitle="Active field work"
            />
            <StatCard
              title="Avg. Resolution Time"
              value="2.8 days"
              icon={Clock}
              color="purple"
              subtitle={`${data?.stats?.totalStaff ?? 0} active municipal staff`}
            />
          </div>

          {/* CHARTS ROW MATCHING REFERENCE DESIGN: Complaints Trend (Line) + Category Distribution (Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Complaints Trend Card (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Complaints Trend</h3>
                  <p className="text-[11px] text-slate-400">Weekly submission vs resolution flow</p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="text-slate-600 font-medium">Submitted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600 font-medium">Resolved</span>
                  </div>
                </div>
              </div>

              {/* Clean SVG Trend Chart matching reference design */}
              <div className="w-full h-56 pt-2 overflow-x-auto">
                <svg viewBox="0 0 500 200" className="w-full h-full min-w-[280px] overflow-visible">
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Y-axis labels */}
                  <text x="30" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">400</text>
                  <text x="30" y="64" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">300</text>
                  <text x="30" y="104" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">200</text>
                  <text x="30" y="144" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">100</text>
                  <text x="30" y="184" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>

                  {/* Submitted Curve (Blue) */}
                  <path
                    d="M 60 130 C 120 120, 160 140, 220 110 C 280 80, 340 105, 400 85 C 430 75, 450 70, 480 65"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Submitted Dots */}
                  <circle cx="60" cy="130" r="3.5" fill="#2563EB" />
                  <circle cx="140" cy="132" r="3.5" fill="#2563EB" />
                  <circle cx="220" cy="110" r="3.5" fill="#2563EB" />
                  <circle cx="300" cy="92" r="3.5" fill="#2563EB" />
                  <circle cx="400" cy="85" r="3.5" fill="#2563EB" />
                  <circle cx="480" cy="65" r="3.5" fill="#2563EB" />

                  {/* Resolved Curve (Emerald) */}
                  <path
                    d="M 60 160 C 120 155, 160 150, 220 135 C 280 120, 340 130, 400 110 C 430 100, 450 95, 480 90"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Resolved Dots */}
                  <circle cx="60" cy="160" r="3.5" fill="#10B981" />
                  <circle cx="140" cy="153" r="3.5" fill="#10B981" />
                  <circle cx="220" cy="135" r="3.5" fill="#10B981" />
                  <circle cx="300" cy="125" r="3.5" fill="#10B981" />
                  <circle cx="400" cy="110" r="3.5" fill="#10B981" />
                  <circle cx="480" cy="90" r="3.5" fill="#10B981" />

                  {/* X-axis labels */}
                  <text x="60" y="196" textAnchor="middle" className="text-[10px] fill-slate-400">Jan</text>
                  <text x="140" y="196" textAnchor="middle" className="text-[10px] fill-slate-400">Feb</text>
                  <text x="220" y="196" textAnchor="middle" className="text-[10px] fill-slate-400">Mar</text>
                  <text x="300" y="196" textAnchor="middle" className="text-[10px] fill-slate-400">Apr</text>
                  <text x="400" y="196" textAnchor="middle" className="text-[10px] fill-slate-400">May</text>
                  <text x="480" y="196" textAnchor="middle" className="text-[10px] fill-slate-400">Jun</text>
                </svg>
              </div>
            </div>

            {/* Category Distribution Donut Card (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-slate-900">Category Distribution</h3>
                <p className="text-[11px] text-slate-400">Breakdown across municipal departments</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-2">
                {/* Donut Chart representation */}
                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="18" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="18"
                      strokeDasharray="238.7"
                      strokeDashoffset="60"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="18"
                      strokeDasharray="238.7"
                      strokeDashoffset="140"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="18"
                      strokeDasharray="238.7"
                      strokeDashoffset="200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="18"
                      strokeDasharray="238.7"
                      strokeDashoffset="220"
                    />
                  </svg>
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-extrabold text-slate-900 leading-none">
                      {data?.stats?.total ?? 0}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Total</span>
                  </div>
                </div>

                {/* Legend list matching reference */}
                <div className="flex-1 space-y-2 w-full text-xs">
                  {(data?.categoryData || []).length > 0 ? (
                    (data.categoryData || []).slice(0, 6).map((cat) => {
                      const pct = (data?.stats?.total || 0) > 0 ? Math.round(((cat?.value || 0) / (data?.stats?.total || 1)) * 100) : 0;
                      const color = categoryColors[cat.name] || "#3B82F6";
                      return (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                            <span className="text-slate-600 truncate">{cat.name}</span>
                          </div>
                          <span className="font-bold text-slate-900 ml-2">{pct}%</span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          <span className="text-slate-600">Roads</span>
                        </div>
                        <span className="font-bold text-slate-900">32%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-slate-600">Garbage</span>
                        </div>
                        <span className="font-bold text-slate-900">24%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                          <span className="text-slate-600">Drainage</span>
                        </div>
                        <span className="font-bold text-slate-900">16%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                          <span className="text-slate-600">Water Leakage</span>
                        </div>
                        <span className="font-bold text-slate-900">10%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <span className="text-slate-600">Streetlight</span>
                        </div>
                        <span className="font-bold text-slate-900">10%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                          <span className="text-slate-600">Property Damage</span>
                        </div>
                        <span className="font-bold text-slate-900">8%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Recent Complaints Table (8 cols) + Pending Assignments (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Complaints Table */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Complaints</h3>
                  <p className="text-[11px] text-slate-400">Newly reported grievances awaiting review</p>
                </div>
                <Link
                  to="/admin/complaints"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {loading && !(data?.recentComplaints?.length) ? (
                <div className="py-12 flex justify-center text-blue-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (data?.recentComplaints || []).length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No complaints registered in the database yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-2.5 font-semibold">ID</th>
                        <th className="pb-2.5 font-semibold">Category</th>
                        <th className="pb-2.5 font-semibold">Location</th>
                        <th className="pb-2.5 font-semibold">Status</th>
                        <th className="pb-2.5 font-semibold">Date</th>
                        <th className="pb-2.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.recentComplaints || []).slice(0, 6).map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 font-mono font-bold text-slate-800">
                            #{c.complaintNumber}
                          </td>
                          <td className="py-3">
                            <span className="flex items-center gap-1.5 font-semibold text-slate-800 truncate max-w-[140px]">
                              {getCategoryIcon(c.category)}
                              {c.category}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 max-w-[150px] truncate">
                            {c.locationAddress}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={c.status} size="sm" />
                          </td>
                          <td className="py-3 text-slate-400 whitespace-nowrap">
                            {dayjs(c.createdAt).format("DD MMM YYYY")}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/admin/complaints/${c._id}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pending Assignments List matching reference right column */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Pending Assignments</h3>
                  <Link to="/admin/complaints" className="text-[11px] font-semibold text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/admin/complaints"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-semibold text-slate-800">Pothole / Road complaints</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/admin/complaints"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-semibold text-slate-800">Garbage / Waste complaints</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/admin/complaints"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-sky-50/40 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
                      <span className="text-xs font-semibold text-slate-800">Drainage complaints</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/admin/complaints"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/40 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span className="text-xs font-semibold text-slate-800">Streetlight complaints</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Municipal Field Health Banner */}
              <div className="mt-4 p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-blue-900">Dispatch Queue SLA</p>
                  <p className="text-[11px] text-blue-700">94% dispatched within 2 hours</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  On Target
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default AdminDashboard;
