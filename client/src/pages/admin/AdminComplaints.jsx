import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import { adminApi, getImageUrl } from "../../api/client";
import {
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import dayjs from "dayjs";

export const AdminComplaints = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchComplaints = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!complaints.length) setLoading(true);

      const res = await adminApi.getAllComplaints({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search,
        page,
        limit: 10
      });
      if (res.data?.data) {
        setComplaints(res.data.data.complaints || []);
        setPagination(res.data.data.pagination || { total: 0, page: 1, pages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(() => {
      fetchComplaints();
    }, 10000);
    return () => clearInterval(interval);
  }, [statusFilter, categoryFilter, priorityFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-200 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Civic Complaint Master Directory
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Oversee grievance lifecycles, reassign officers, and monitor municipal resolutions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchComplaints(true)}
                disabled={refreshing}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-[#0F172A] hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                title="Refresh Complaints List"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-bold">
                Total: {pagination.total}
              </span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-[#0F172A] rounded-2xl p-4 border border-slate-800/80 shadow-lg flex flex-col md:flex-row items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by complaint number, keyword, or area..."
                className="w-full pl-10 pr-4 py-2 bg-[#070B14] border border-slate-750/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-auto px-3 py-2 bg-[#070B14] border border-slate-700/80 text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REOPENED">Reopened</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-auto px-3 py-2 bg-[#070B14] border border-slate-700/80 text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Roads">Roads</option>
                <option value="Drainage">Drainage</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Street Infrastructure">Street Infrastructure</option>
                <option value="Public Property">Public Property</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-auto px-3 py-2 bg-[#070B14] border border-slate-700/80 text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Master Complaints Table */}
          <div className="bg-[#0F172A] rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center text-teal-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-200">No complaints matching filter criteria</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the status or department filters above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0B1120] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-semibold">ID</th>
                      <th className="py-3.5 px-4 font-semibold">Title & Category</th>
                      <th className="py-3.5 px-4 font-semibold">Citizen</th>
                      <th className="py-3.5 px-4 font-semibold">Assigned Staff</th>
                      <th className="py-3.5 px-4 font-semibold">Priority</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Date</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {complaints.map((comp) => (
                      <tr key={comp._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-400">
                          #{comp.complaintNumber}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-semibold text-slate-100 line-clamp-1">{comp.title}</p>
                          <p className="text-xs text-slate-400">{comp.category}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {comp.citizen?.name || "Citizen"}
                        </td>
                        <td className="py-3.5 px-4">
                          {comp.assignedStaff ? (
                            <div>
                              <p className="font-semibold text-slate-200">{comp.assignedStaff.name}</p>
                              <p className="text-[10px] text-slate-400">{comp.assignedStaff.department}</p>
                            </div>
                          ) : (
                            <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold text-[10px]">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <PriorityBadge priority={comp.priority} />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={comp.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {dayjs(comp.createdAt).format("DD MMM YYYY")}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link
                            to={`/admin/complaints/${comp._id}`}
                            className="px-3 py-1 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-xs font-semibold text-teal-300 transition-colors"
                          >
                            Review & Assign
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 bg-[#0B1120] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing page <span className="font-bold text-slate-200">{pagination.page}</span> of <span className="font-bold text-slate-200">{pagination.pages}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-[#070B14] hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-[#070B14] hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNavBottom />
    </div>
  );
};

export default AdminComplaints;
