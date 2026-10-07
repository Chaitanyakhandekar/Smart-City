import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import ChatbotWidget from "../../components/ChatbotWidget";
import { complaintApi, getImageUrl } from "../../api/client";
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Calendar,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import dayjs from "dayjs";

import MobileNavBottom from "../../components/MobileNavBottom";

export const CitizenComplaints = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchComplaints = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!complaints.length) setLoading(true);

      const res = await complaintApi.getMyComplaints({
        status: statusFilter,
        category: categoryFilter,
        search
      });
      if (res.data?.data) {
        setComplaints(res.data.data.complaints || []);
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
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                My Grievance History
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                View resolution progress, photographic proofs, and feedback actions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchComplaints(true)}
                disabled={refreshing}
                className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-[#0F172A] hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Refresh Grievances"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                to="/citizen/report"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" /> Report Issue
              </Link>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-[#0F172A]/90 rounded-2xl p-4 border border-slate-800/80 shadow-md mb-6">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <form onSubmit={handleSearch} className="flex-1 relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by complaint ID, title, or location..."
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
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REOPENED">Reopened</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-[#070B14] border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-teal-400"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Roads">Roads</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Street Infrastructure">Street Infrastructure</option>
                  <option value="Public Property">Public Property</option>
                </select>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          {loading ? (
            <div className="py-20 flex justify-center text-teal-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-[#0F172A] rounded-3xl p-12 text-center border border-slate-800 shadow-md">
              <p className="text-base font-semibold text-slate-200">No complaints found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {complaints.map((comp) => {
                const beforeUrl = comp.beforeImage ? getImageUrl(comp.beforeImage) : null;

                return (
                  <div
                    key={comp._id}
                    className="bg-[#0F172A]/90 rounded-3xl p-5 border border-slate-800 hover:border-slate-700 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-extrabold text-teal-300 bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-500/30">
                          #{comp.complaintNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={comp.priority} />
                          <StatusBadge status={comp.status} size="sm" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-white text-base mb-1 line-clamp-1">
                        {comp.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {comp.description}
                      </p>

                      {/* Photo Thumbnail + Location */}
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
                            {comp.locationAddress}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Dept: <span className="text-slate-300">{comp.category}</span> • {comp.subcategory || "General"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {dayjs(comp.createdAt).format("DD MMM YYYY")}
                      </span>

                      <Link
                        to={`/citizen/complaints/${comp._id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#070B14] hover:bg-teal-950/40 hover:text-teal-300 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors flex items-center gap-1"
                      >
                        Details & Proof <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <ChatbotWidget />
      <MobileNavBottom />
    </div>
  );
};

export default CitizenComplaints;
