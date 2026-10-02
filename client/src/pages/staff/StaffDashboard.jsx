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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Field Operations Console
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/40 text-[10px] font-bold text-blue-200 border border-blue-400/30">
                  {user?.department || "Municipal Field Department"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mt-1">
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
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 shadow-xs transition-all flex items-center gap-1.5"
                title="Refresh Tasks"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                to="/staff/tasks"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
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
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Urgent Field Assignments</h3>
                <p className="text-xs text-slate-400">Tasks requiring inspection or completion photo</p>
              </div>
              <Link
                to="/staff/tasks"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                All Tasks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : data.recentTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No assigned tasks currently pending in your department.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3 font-semibold">ID</th>
                      <th className="pb-3 px-3 font-semibold">Title & Category</th>
                      <th className="pb-3 px-3 font-semibold">Location</th>
                      <th className="pb-3 px-3 font-semibold">Priority</th>
                      <th className="pb-3 px-3 font-semibold">Status</th>
                      <th className="pb-3 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentTasks.map((task) => {
                      const isUrgent = task.priority === "CRITICAL" || task.priority === "HIGH";
                      return (
                        <tr
                          key={task._id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isUrgent ? "bg-rose-50/20" : ""
                          }`}
                        >
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                            #{task.complaintNumber}
                          </td>
                          <td className="py-3.5 px-3">
                            <p className="font-semibold text-slate-900 line-clamp-1">{task.title}</p>
                            <p className="text-[11px] text-slate-400">{task.category}</p>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
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
                              to={`/staff/complaints/${task._id}`}
                              className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
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
