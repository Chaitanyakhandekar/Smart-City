import React from "react";
import dayjs from "dayjs";
import {
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  FileText,
  Cpu
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export const TimelineView = ({ updates = [] }) => {
  if (!updates || updates.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 text-xs">
        No timeline events recorded yet.
      </div>
    );
  }

  const getStepConfig = (status, message = "") => {
    const isAi = message?.toLowerCase().includes("ai") || message?.toLowerCase().includes("classification");
    if (isAi) {
      return {
        icon: Cpu,
        bg: "bg-emerald-500 text-white ring-4 ring-emerald-100",
        label: "AI Classification"
      };
    }

    switch (status) {
      case "RESOLVED":
        return {
          icon: CheckCircle2,
          bg: "bg-emerald-600 text-white ring-4 ring-emerald-100",
          label: "Work Completed & Resolved"
        };
      case "IN_PROGRESS":
        return {
          icon: Wrench,
          bg: "bg-blue-600 text-white ring-4 ring-blue-100",
          label: "Work In Progress"
        };
      case "ASSIGNED":
        return {
          icon: UserCheck,
          bg: "bg-amber-500 text-white ring-4 ring-amber-100",
          label: "Assigned to Department / Staff"
        };
      case "REOPENED":
        return {
          icon: RotateCcw,
          bg: "bg-rose-500 text-white ring-4 ring-rose-100",
          label: "Citizen Reopened Grievance"
        };
      case "REJECTED":
        return {
          icon: AlertTriangle,
          bg: "bg-slate-500 text-white ring-4 ring-slate-100",
          label: "Grievance Rejected"
        };
      case "SUBMITTED":
      default:
        return {
          icon: Clock,
          bg: "bg-blue-600 text-white ring-4 ring-blue-100",
          label: "Complaint Submitted"
        };
    }
  };

  return (
    <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {updates.map((update, idx) => {
        const config = getStepConfig(update.status, update.message);
        const Icon = config.icon;

        return (
          <div key={update._id || idx} className="relative group">
            {/* Step Icon Indicator Node matching reference design */}
            <div
              className={`absolute -left-7 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${config.bg}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Timeline Item Details */}
            <div className="bg-[#070B14]/80 p-4 rounded-2xl border border-slate-800/90 shadow-sm hover:border-slate-700 transition-all space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100">
                    {config.label}
                  </span>
                  {update.status && <StatusBadge status={update.status} size="sm" />}
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {dayjs(update.createdAt).format("DD MMM YYYY, hh:mm A")}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {update.message}
              </p>

              {update.user && (
                <p className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                  Updated by: <span className="font-semibold text-slate-300">{update.user.name}</span> ({update.user.role})
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineView;
