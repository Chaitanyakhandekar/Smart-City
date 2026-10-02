import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import TimelineView from "../../components/TimelineView";
import BeforeAfterComparison from "../../components/BeforeAfterComparison";
import ChatbotWidget from "../../components/ChatbotWidget";
import { complaintApi, getImageUrl } from "../../api/client";
import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  User,
  Phone,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Check,
  Building,
  Image as ImageIcon,
  Cpu
} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export const CitizenComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complaintData, setComplaintData] = useState(null);
  const [searchId, setSearchId] = useState("");

  // Reopen Modal
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintApi.getComplaintById(id);
      if (res.data?.data) {
        setComplaintData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch complaint details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/citizen/complaints/${searchId.trim()}`);
      setSearchId("");
    }
  };

  const handleConfirmResolution = async () => {
    try {
      setActionLoading(true);
      await complaintApi.confirmResolution(id);
      toast.success("Thank you! Resolution confirmed. Case closed.");
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm resolution.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenComplaint = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim() || reopenReason.trim().length < 5) {
      toast.error("Please explain why this issue requires reopening (at least 5 characters).");
      return;
    }

    try {
      setActionLoading(true);
      await complaintApi.reopenComplaint(id, { reopenReason: reopenReason.trim() });
      toast.success("Complaint reopened and escalated to municipal administration.");
      setShowReopenModal(false);
      setReopenReason("");
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reopen complaint.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex items-center justify-center text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!complaintData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-slate-700 font-bold">Complaint record not found.</p>
          <Link to="/citizen/complaints" className="mt-2 text-blue-600 hover:underline text-xs font-semibold">
            Return to complaint history
          </Link>
        </div>
      </div>
    );
  }

  const { complaint, beforeImage, afterImage, progressImages, timeline } = complaintData;
  const beforePhotoUrl = beforeImage ? getImageUrl(beforeImage?.imageUrl || beforeImage) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          {/* Header matching reference: Arrow back + "Track Your Complaint" + search input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/citizen/complaints"
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-xs"
                aria-label="Back to complaints"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Track Your Complaint
                </h1>
                <p className="text-xs text-slate-500">
                  Real-time status updates and municipal audit trail
                </p>
              </div>
            </div>

            {/* Quick Search ID input matching top right of reference */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xs w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter complaint ID"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-xs transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* MAIN STATUS CARD MATCHING REFERENCE TOP RIGHT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Complaint Status
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-900">
                    #{complaint.complaintNumber}
                  </span>
                  <StatusBadge status={complaint.status} size="sm" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted on {dayjs(complaint.createdAt).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>

              <PriorityBadge priority={complaint.priority} />
            </div>

            {/* Complaint Title & Details */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">
                {complaint.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Department & Officer meta row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 mt-0.5">{complaint.category}</p>
                <p className="text-[11px] text-slate-500">{complaint.subcategory || "General"}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Staff</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {complaint.assignedStaff ? complaint.assignedStaff.name : "Pending Dispatch"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {complaint.assignedStaff ? complaint.assignedStaff.department : "Municipal Queue"}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Priority Level</span>
                <p className="font-semibold text-blue-700 mt-0.5">{complaint.priority}</p>
                <p className="text-[11px] text-slate-500">SLA: 24-48 Hours</p>
              </div>
            </div>

            {/* AI CLASSIFICATION & PRIORITY RESULT */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-blue-600" /> AI Classification & Priority Analysis
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                  AI Confidence: {complaint.aiConfidence ? `${Math.round(complaint.aiConfidence * 100)}%` : "Pending AI Analysis"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Category</p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">
                    {complaint.aiCategory || complaint.category || "Pending AI Analysis"}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Subcategory</p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">
                    {complaint.aiSubcategory || complaint.subcategory || (complaint.aiCategory ? "General Issue" : "Pending AI Analysis")}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">AI Priority</p>
                  <p className="font-bold text-amber-600 mt-0.5 truncate">
                    {complaint.aiPriority || complaint.priority || "Pending AI Analysis"}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">AI Confidence</p>
                  <p className="font-bold text-blue-700 mt-0.5 truncate">
                    {complaint.aiConfidence ? `${Math.round(complaint.aiConfidence * 100)}%` : "Pending AI Analysis"}
                  </p>
                </div>
              </div>
            </div>

            {/* LIFECYCLE TIMELINE MATCHING REFERENCE */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Resolution Timeline
              </h3>
              <TimelineView updates={timeline} />
            </div>
          </div>

          {/* CITIZEN CONFIRMATION ACTION BANNER (When marked RESOLVED) */}
          {complaint.status === "RESOLVED" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> Resolution Completed
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                    Has this civic issue been satisfactorily resolved?
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Please inspect the before & after evidence below. Your confirmation helps us maintain high civic service standards.
                  </p>
                </div>

                {complaint.citizenConfirmed === true ? (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs whitespace-nowrap">
                    <Check className="w-4 h-4" /> Resolution Confirmed
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleConfirmResolution}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Yes, Resolved
                    </button>
                    <button
                      onClick={() => setShowReopenModal(true)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" /> Reopen Issue
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REOPENED BANNER IF APPLICABLE */}
          {complaint.status === "REOPENED" && (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-950">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-800 uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Complaint Reopened by Citizen
              </div>
              <p className="text-xs text-rose-800">
                <span className="font-semibold">Reason provided:</span> "{complaint.reopenReason}"
              </p>
            </div>
          )}

          {/* MINI-MAP / LOCATION CARD & EVIDENCE PREVIEW (Matching bottom of reference right panel) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Location & Visual Evidence
            </h3>

            {/* Address bar */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              {beforePhotoUrl ? (
                <img
                  src={beforePhotoUrl}
                  alt={complaint.title}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{complaint.title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  {complaint.locationAddress}
                </p>
              </div>
            </div>

            {/* Before / After photographic comparison */}
            <div className="pt-2">
              <BeforeAfterComparison
                beforeImage={beforeImage}
                afterImage={afterImage}
                progressImages={progressImages}
              />
            </div>
          </div>
        </main>
      </div>

      {/* REOPEN MODAL */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Reopen Complaint
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Why are you reopening complaint #{complaint.complaintNumber}? Please specify why the repair was incomplete or unsatisfactory.
            </p>

            <form onSubmit={handleReopenComplaint} className="space-y-4">
              <textarea
                required
                rows={4}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. The garbage was only partially collected, spilled waste was left behind on the road corner..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500 focus:bg-white resize-y"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reopen & Escalate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChatbotWidget />
      <MobileNavBottom />
    </div>
  );
};

export default CitizenComplaintDetail;
