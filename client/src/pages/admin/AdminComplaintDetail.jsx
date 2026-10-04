import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import TimelineView from "../../components/TimelineView";
import BeforeAfterComparison from "../../components/BeforeAfterComparison";
import { complaintApi, adminApi } from "../../api/client";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Cpu,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Save,
  Check
} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const MUNICIPAL_CATEGORIES = [
  "Waste Management",
  "Roads",
  "Drainage",
  "Water Supply",
  "Street Infrastructure",
  "Public Property",
  "Other"
];

export const AdminComplaintDetail = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complaintData, setComplaintData] = useState(null);
  const [staffList, setStaffList] = useState([]);

  // Editable Form State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("MEDIUM");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaintAndStaff = async () => {
    try {
      setLoading(true);
      const [compRes, staffRes] = await Promise.all([
        complaintApi.getComplaintById(id),
        adminApi.getStaffList()
      ]);

      if (compRes.data?.data) {
        const comp = compRes.data.data.complaint;
        setComplaintData(compRes.data.data);
        setSelectedCategory(comp.category);
        setSelectedPriority(comp.priority);
        setSelectedStaffId(comp.assignedStaff?._id || "");
      }

      if (staffRes.data?.data) {
        setStaffList(staffRes.data.data.staff || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load complaint data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintAndStaff();
  }, [id]);

  // Save Category/Priority Override
  const handleUpdateClassification = async () => {
    try {
      setActionLoading(true);
      await adminApi.updateComplaint(id, {
        category: selectedCategory,
        priority: selectedPriority
      });
      toast.success("Classification updated successfully.");
      fetchComplaintAndStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update complaint.");
    } finally {
      setActionLoading(false);
    }
  };

  // Assign or Reassign Staff
  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error("Please select a municipal officer to assign.");
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.assignStaff(id, {
        staffId: selectedStaffId,
        remarks: assignmentNote
      });
      toast.success("Staff assigned successfully!");
      setAssignmentNote("");
      fetchComplaintAndStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign staff.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Complaint
  const handleRejectComplaint = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error("Please provide a rejection reason (at least 5 characters).");
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.rejectComplaint(id, { reason: rejectReason.trim() });
      toast.success("Complaint rejected.");
      setShowRejectModal(false);
      setRejectReason("");
      fetchComplaintAndStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject complaint.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col font-sans">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex items-center justify-center text-teal-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!complaintData) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col font-sans">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-slate-300 font-semibold">Complaint record not found.</p>
          <Link to="/admin/complaints" className="mt-2 text-teal-400 hover:underline text-xs font-semibold">
            Back to master table
          </Link>
        </div>
      </div>
    );
  }

  const { complaint, beforeImage, afterImage, progressImages, timeline } = complaintData;
  const hasAiConfidence = typeof complaint.aiConfidence === "number" && complaint.aiConfidence > 0;
  const confidencePct = hasAiConfidence ? Math.round(complaint.aiConfidence * 100) : null;

  // Filter staff by current category for recommended matches
  const matchingDeptStaff = staffList.filter(
    (s) => s.isActive && s.department === complaint.category
  );
  const otherStaff = staffList.filter(
    (s) => s.isActive && s.department !== complaint.category
  );

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-200 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Master Directory
            </Link>
            <span className="text-xs text-slate-400 font-mono">
              Created: {dayjs(complaint.createdAt).format("DD MMM YYYY, hh:mm A")}
            </span>
          </div>

          {/* MAIN RECORD HEADER */}
          <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-lg border border-teal-500/30">
                  #{complaint.complaintNumber}
                </span>
                <StatusBadge status={complaint.status} />
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={complaint.priority} />
                {complaint.status !== "REJECTED" && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-3 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
                  >
                    Reject Issue
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white">{complaint.title}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">{complaint.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Location Address</p>
                  <p className="text-slate-400">{complaint.locationAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Reporting Citizen</p>
                  <p className="text-slate-400">{complaint.citizen?.name} ({complaint.citizen?.email})</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Citizen Contact</p>
                  <p className="text-slate-400">{complaint.citizen?.phone || "No phone on file"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI CLASSIFICATION REVIEW & MANUAL OVERRIDE SECTION */}
          <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-7 border border-slate-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <Cpu className="w-4 h-4 text-cyan-400" />
                AI Vision Prediction & Intelligent Recommendation
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Confidence: {confidencePct !== null ? `${confidencePct}%` : "Pending AI Analysis"}
              </span>
            </div>

            {/* Confidence Progress Bar */}
            {confidencePct !== null ? (
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${confidencePct}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Computer vision model evaluated visual attributes, contours, and citizen text description
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                AI analysis has not completed or is awaiting review.
              </p>
            )}

            {/* AI SUGGESTION TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#070B14] border border-slate-800 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">AI Category</p>
                <p className="font-bold text-slate-100 mt-0.5">{complaint.aiCategory || "Pending AI Analysis"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">AI Subcategory</p>
                <p className="font-bold text-slate-100 mt-0.5">{complaint.aiSubcategory || (complaint.aiCategory ? "General Issue" : "Pending AI Analysis")}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Suggested Urgency</p>
                <p className="font-bold text-amber-400 mt-0.5">{complaint.aiPriority || "Pending AI Analysis"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Status</p>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {complaint.aiCategory ? "AI Classified" : "Pending AI Analysis"}
                </p>
              </div>
            </div>

            {/* ADMIN OVERRIDE CONTROLS */}
            <div className="p-5 rounded-2xl border border-slate-800/80 bg-[#0B1120] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Administrative Classification Override
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Final Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070B14] border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  >
                    {MUNICIPAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Final Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070B14] border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateClassification}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Final Classification
                </button>
              </div>
            </div>
          </div>

          {/* STAFF ASSIGNMENT / DISPATCH SECTION */}
          <div className="bg-[#0F172A] rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <UserCheck className="w-4 h-4 text-amber-400" />
                Assign or Reassign Municipal Field Officer
              </div>
              {complaint.assignedStaff && (
                <span className="text-xs text-slate-400">
                  Currently Assigned: <span className="font-bold text-amber-300">{complaint.assignedStaff.name}</span>
                </span>
              )}
            </div>

            <form onSubmit={handleAssignStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Select Field Staff Member *
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#070B14] border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Choose Field Officer --</option>
                  {matchingDeptStaff.length > 0 && (
                    <optgroup label={`Recommended: Matching Department (${complaint.category})`}>
                      {matchingDeptStaff.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          ⭐ {staff.name} — {staff.designation || "Officer"} ({staff.department}) [{staff.assignedCount || 0} active]
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {otherStaff.length > 0 && (
                    <optgroup label="Other Municipal Staff">
                      {otherStaff.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} — {staff.department} ({staff.designation || "Officer"}) [{staff.assignedCount || 0} active]
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Dispatch Instructions / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="e.g. Priority repair needed before Monday morning peak traffic..."
                  className="w-full px-3.5 py-2 bg-[#070B14] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading || !selectedStaffId}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  {complaint.assignedStaff ? "Reassign Officer" : "Dispatch & Assign Staff"}
                </button>
              </div>
            </form>
          </div>

          {/* BEFORE / AFTER PHOTO VERIFICATION */}
          <div className="bg-[#0F172A] rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Photographic Proofs
            </h3>
            <BeforeAfterComparison
              beforeImage={beforeImage}
              afterImage={afterImage}
              progressImages={progressImages}
            />
          </div>

          {/* TIMELINE */}
          <div className="bg-[#0F172A] rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Activity History & Dispatch Audit Log
            </h3>
            <TimelineView updates={timeline} />
          </div>
        </main>
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 max-h-[90dvh] overflow-y-auto text-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Reject Complaint</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Please enter the official reason for rejecting complaint #{complaint.complaintNumber} (e.g. duplicate submission, outside municipal jurisdiction).
            </p>

            <form onSubmit={handleRejectComplaint} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full p-3 bg-[#070B14] border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500 resize-y"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileNavBottom />
    </div>
  );
};

export default AdminComplaintDetail;
