import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContex";
import { staffApi, getImageUrl } from "../../api/client";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import {
  Briefcase,
  CheckSquare,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Loader2,
  MapPin,
  Calendar,
  RefreshCw,
  Clock
} from "lucide-react";
import dayjs from "dayjs";

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    stats: { assigned: 0, inProgress: 0, resolved: 0, highPriority: 0 },
    recentTasks: []
  });

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!data.recentTasks.length) setLoading(true);

      const res = await staffApi.getDashboard();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Staff dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-800 rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Field Operations Console
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/40 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  {user?.department || "Municipal Field Department"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mt-1 text-white">
                Officer {user?.name}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl">
                Inspect assigned grievances, update field progress, and submit verified completion photographs to resolve cases.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="px-3.5 py-2.5 rounded-xl bg-[#070B14] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 shadow-xs transition-all flex items-center gap-1.5"
                title="Refresh Tasks"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                to="/staff/tasks"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <CheckSquare className="w-4 h-4" />
                View Assigned Tasks
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            <StatCard
              title="Assigned Tasks"
              value={data.stats.assigned}
              icon={CheckSquare}
              color="amber"
              subtitle="Pending on-site visit"
            />
            <StatCard
              title="In Progress"
              value={data.stats.inProgress}
              icon={Wrench}
              color="blue"
              subtitle="Active fieldwork"
            />
            <StatCard
              title="Resolved"
              value={data.stats.resolved}
              icon={CheckCircle2}
              color="emerald"
              subtitle="Successfully verified"
            />
            <StatCard
              title="High / Critical"
              value={data.stats.highPriority}
              icon={AlertOctagon}
              color="rose"
              subtitle="Urgent civic hazards"
            />
          </div>

          {/* Urgent Field Assignments */}
          <div className="bg-[#0F172A]/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Urgent Field Assignments</h3>
                <p className="text-xs text-slate-400">Tasks requiring inspection or completion photo</p>
              </div>
              <Link
                to="/staff/tasks"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                All Tasks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-teal-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : data.recentTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No assigned tasks currently pending in your department.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3 font-semibold">ID</th>
                      <th className="pb-3 px-3 font-semibold">Title & Category</th>
                      <th className="pb-3 px-3 font-semibold">Location</th>
                      <th className="pb-3 px-3 font-semibold">Priority</th>
                      <th className="pb-3 px-3 font-semibold">Status</th>
                      <th className="pb-3 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {data.recentTasks.map((task) => {
                      const isUrgent = task.priority === "CRITICAL" || task.priority === "HIGH";
                      return (
                        <tr
                          key={task._id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isUrgent ? "bg-rose-950/20" : ""
                          }`}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-white">
                            #{task.complaintNumber}
                          </td>
                          <td className="py-3.5 px-3">
                            <p className="font-semibold text-slate-200 line-clamp-1">{task.title}</p>
                            <p className="text-[11px] text-slate-400">{task.category}</p>
                          </td>
                          <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">
                            {task.locationAddress}
                          </td>
                          <td className="py-3.5 px-3">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="py-3.5 px-3">
                            <StatusBadge status={task.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <Link
                              to={`/staff/tasks/${task._id}`}
                              className="px-3 py-1 rounded-lg bg-[#070B14] hover:bg-teal-950/40 hover:text-teal-300 text-slate-300 border border-slate-800 font-semibold text-[11px] transition-colors"
                            >
                              Inspect & Work
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default StaffDashboard;
