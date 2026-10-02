import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import TimelineView from "../../components/TimelineView";
import BeforeAfterComparison from "../../components/BeforeAfterComparison";
import ImageUploadPreview from "../../components/ImageUploadPreview";
import { complaintApi, staffApi, getImageUrl } from "../../api/client";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Wrench,
  CheckCircle2,
  Camera,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Cpu
} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export const StaffTaskDetail = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complaintData, setComplaintData] = useState(null);

  // Modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [startRemarks, setStartRemarks] = useState("");
  const [startPhoto, setStartPhoto] = useState(null);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveRemarks, setResolveRemarks] = useState("");
  const [afterPhoto, setAfterPhoto] = useState(null);

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
      toast.error("Could not load task details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Handle Start Work (ASSIGNED -> IN_PROGRESS)
  const handleStartWork = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData();
      if (startRemarks.trim()) formData.append("remarks", startRemarks.trim());
      if (startPhoto) formData.append("image", startPhoto);

      await staffApi.startWork(id, formData);
      toast.success("Task marked IN_PROGRESS. Field work commenced.");
      setShowStartModal(false);
      setStartRemarks("");
      setStartPhoto(null);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start work.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Resolve (IN_PROGRESS -> RESOLVED)
  const handleResolve = async (e) => {
    e.preventDefault();

    if (!resolveRemarks.trim() || resolveRemarks.trim().length < 5) {
      toast.error("Please enter resolution remarks (at least 5 characters).");
      return;
    }

    if (!afterPhoto) {
      toast.error("An AFTER resolution photograph is strictly required to close the task!");
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("remarks", resolveRemarks.trim());
      formData.append("image", afterPhoto);

      await staffApi.resolveTask(id, formData);
      toast.success("Grievance marked RESOLVED with photographic verification!");
      setShowResolveModal(false);
      setResolveRemarks("");
      setAfterPhoto(null);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve task.");
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
          <p className="text-slate-600 font-semibold">Task not found.</p>
          <Link to="/staff/tasks" className="mt-2 text-blue-600 hover:underline text-xs font-semibold">
            Back to Assigned Tasks
          </Link>
        </div>
      </div>
    );
  }

  const { complaint, beforeImage, afterImage, progressImages, timeline } = complaintData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/staff/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Assigned Tasks
            </Link>
            <span className="text-xs text-slate-400 font-mono">
              Reported: {dayjs(complaint.createdAt).format("DD MMM YYYY, hh:mm A")}
            </span>
          </div>

          {/* ACTION BUTTONS BANNER */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Action Required
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-extrabold text-slate-900">
                  Current Status:
                </span>
                <StatusBadge status={complaint.status} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {(complaint.status === "ASSIGNED" || complaint.status === "REOPENED") && (
                <button
                  onClick={() => setShowStartModal(true)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" /> Start Work (Mark In-Progress)
                </button>
              )}

              {complaint.status === "IN_PROGRESS" && (
                <button
                  onClick={() => setShowResolveModal(true)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Complaint Resolved (Upload Proof)
                </button>
              )}

              {complaint.status === "RESOLVED" && (
                <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Marked Resolved • Verification Photo Attached
                </span>
              )}
            </div>
          </div>

          {/* REOPENED ALERT IF ANY */}
          {complaint.status === "REOPENED" && (
            <div className="bg-rose-50 border border-rose-300 rounded-3xl p-5 text-rose-950">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-800 uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Citizen Has Reopened This Grievance
              </div>
              <p className="text-xs text-rose-800">
                <span className="font-semibold">Citizen Feedback:</span> "{complaint.reopenReason}"
              </p>
            </div>
          )}

          {/* COMPLAINT OVERVIEW */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  #{complaint.complaintNumber}
                </span>
                <StatusBadge status={complaint.status} />
              </div>
              <PriorityBadge priority={complaint.priority} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">{complaint.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{complaint.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">Location</p>
                  <p className="text-slate-500">{complaint.locationAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">Reporting Citizen</p>
                  <p className="text-slate-500">
                    {complaint.citizen?.name} ({complaint.citizen?.phone || "No phone"})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">Category & Dept</p>
                  <p className="text-slate-500">{complaint.category} • {complaint.subcategory || "General"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI CLASSIFICATION & PRIORITY DETAILS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-blue-600" /> AI Classification & Auto-Assigned Priority
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                AI Confidence: {complaint.aiConfidence ? `${Math.round(complaint.aiConfidence * 100)}%` : "Pending AI Analysis"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Category</p>
                <p className="font-bold text-slate-800 mt-0.5 truncate">
                  {complaint.aiCategory || complaint.category || "Pending AI Analysis"}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Subcategory</p>
                <p className="font-bold text-slate-800 mt-0.5 truncate">
                  {complaint.aiSubcategory || complaint.subcategory || (complaint.aiCategory ? "General Issue" : "Pending AI Analysis")}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Priority Level</p>
                <p className="font-bold text-amber-600 mt-0.5 truncate">
                  {complaint.aiPriority || complaint.priority || "Pending AI Analysis"}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">AI Analysis Status</p>
                <p className="font-bold text-emerald-600 mt-0.5 truncate">
                  {complaint.aiCategory ? "Verified" : "Pending AI Analysis"}
                </p>
              </div>
            </div>
          </div>

          {/* EVIDENCE SECTION */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Photographic Evidence (Before & After)
            </h3>
            <BeforeAfterComparison
              beforeImage={beforeImage}
              afterImage={afterImage}
              progressImages={progressImages}
            />
          </div>

          {/* TIMELINE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Activity & Actions Timeline
            </h3>
            <TimelineView updates={timeline} />
          </div>
        </main>
      </div>

      {/* MODAL: START WORK */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Commence Field Work</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Mark this task as IN_PROGRESS to notify citizen and city administration.
            </p>

            <form onSubmit={handleStartWork} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Field Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={startRemarks}
                  onChange={(e) => setStartRemarks(e.target.value)}
                  placeholder="e.g., Arrived at site with asphalt maintenance crew..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              <ImageUploadPreview
                onImageChange={(file) => setStartPhoto(file)}
                required={false}
                label="Interim Progress Photo (Optional)"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Start"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE TASK (STRICTLY REQUIRES AFTER PHOTO & REMARKS) */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Mark Task Resolved</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              A photograph of the completed repair ("AFTER" photo) and resolution remarks are mandatory for verification.
            </p>

            <form onSubmit={handleResolve} className="space-y-4">
              <ImageUploadPreview
                onImageChange={(file) => setAfterPhoto(file)}
                required={true}
                label="Resolution Photograph (AFTER Photo) *"
              />

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Resolution Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolveRemarks}
                  onChange={(e) => setResolveRemarks(e.target.value)}
                  placeholder="e.g. Garbage cleared and area disinfected. Road patched with bitumen..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading & Resolving...
                    </>
                  ) : (
                    "Submit Resolution Proof"
                  )}
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

export default StaffTaskDetail;
