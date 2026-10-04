import React from "react";
import {
  Clock,
  Eye,
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";

export const StatusBadge = ({ status, size = "md" }) => {
  const configs = {
    SUBMITTED: {
      label: "Submitted",
      bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: Clock,
      dot: "bg-amber-400"
    },
    UNDER_REVIEW: {
      label: "Under Review",
      bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      icon: Eye,
      dot: "bg-cyan-400"
    },
    ASSIGNED: {
      label: "Assigned",
      bg: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      icon: UserCheck,
      dot: "bg-sky-400"
    },
    IN_PROGRESS: {
      label: "In Progress",
      bg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      icon: Wrench,
      dot: "bg-teal-400"
    },
    RESOLVED: {
      label: "Resolved",
      bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: CheckCircle2,
      dot: "bg-emerald-400"
    },
    REOPENED: {
      label: "Reopened",
      bg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      icon: AlertCircle,
      dot: "bg-rose-400"
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-slate-800 text-slate-400 border-slate-700",
      icon: XCircle,
      dot: "bg-slate-500"
    }
  };

  const config = configs[status] || {
    label: status || "Unknown",
    bg: "bg-slate-800 text-slate-300 border-slate-700",
    icon: Clock,
    dot: "bg-slate-500"
  };

  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs md:text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses} transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
