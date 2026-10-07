import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import { staffApi, getImageUrl } from "../../api/client";
import {
  Search,
  CheckSquare,
  MapPin,
  Calendar,
  Loader2,
  ArrowRight,
  Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import dayjs from "dayjs";

export const StaffTasks = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchTasks = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!tasks.length) setLoading(true);

      const res = await staffApi.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        search
      });
      if (res.data?.data) {
        setTasks(res.data.data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
      fetchTasks();
    }, 10000);
    return () => clearInterval(interval);
  }, [statusFilter, priorityFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Assigned Field Tasks
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Grievances dispatched to your department requiring on-site resolution
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchTasks(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-[#0F172A] border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Refresh Assigned Tasks"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Tasks"}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-[#0F172A]/90 rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col md:flex-row items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, keyword, or street address..."
                className="w-full pl-10 pr-4 py-2 bg-[#070B14] border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto md:flex md:items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 bg-[#070B14] border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-teal-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REOPENED">Reopened</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 bg-[#070B14] border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-teal-400"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="py-20 flex justify-center text-teal-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-[#0F172A] rounded-3xl p-12 text-center border border-slate-800 shadow-md">
              <p className="text-base font-semibold text-slate-200">No tasks found</p>
              <p className="text-xs text-slate-400 mt-1">Check back later or adjust your status filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {tasks.map((task) => {
                const beforeUrl = task.beforeImage ? getImageUrl(task.beforeImage) : null;
                const isHighPriority = task.priority === "CRITICAL" || task.priority === "HIGH";

                return (
                  <div
                    key={task._id}
                    className={`bg-[#0F172A]/90 rounded-3xl p-5 border shadow-md hover:shadow-lg transition-all flex flex-col justify-between ${
                      isHighPriority ? "border-amber-500/40 ring-1 ring-amber-500/20" : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-500/30">
                          #{task.complaintNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} size="sm" />
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-base mb-1 line-clamp-1">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {task.description}
                      </p>

                      <div className="flex items-center gap-3 mb-3">
                        {beforeUrl ? (
                          <img
                            src={beforeUrl}
                            alt="Before"
                            className="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex flex-col text-xs text-slate-400 space-y-1">
                          <span className="flex items-center gap-1 line-clamp-1 font-medium text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                            {task.locationAddress}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Citizen: {task.citizen?.name || "Civic Citizen"} ({task.citizen?.phone || "No phone"})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {dayjs(task.createdAt).format("DD MMM YYYY")}
                      </span>

                      <Link
                        to={`/staff/tasks/${task._id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#070B14] hover:bg-teal-950/40 hover:text-teal-300 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        Inspect & Action <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default StaffTasks;
