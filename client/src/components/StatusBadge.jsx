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
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
      icon: Clock,
      dot: "bg-amber-500"
    },
    UNDER_REVIEW: {
      label: "Under Review",
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
      icon: Eye,
      dot: "bg-amber-500"
    },
    ASSIGNED: {
      label: "Assigned",
      bg: "bg-blue-50 text-blue-700 border-blue-200/80",
      icon: UserCheck,
      dot: "bg-blue-500"
    },
    IN_PROGRESS: {
      label: "In Progress",
      bg: "bg-blue-50 text-blue-700 border-blue-200/80",
      icon: Wrench,
      dot: "bg-blue-500"
    },
    RESOLVED: {
      label: "Resolved",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      icon: CheckCircle2,
      dot: "bg-emerald-500"
    },
    REOPENED: {
      label: "Reopened",
      bg: "bg-rose-50 text-rose-700 border-rose-200/80",
      icon: AlertCircle,
      dot: "bg-rose-500"
    },
    REJECTED: {
      label: "Rejected",
      bg: "bg-slate-100 text-slate-700 border-slate-200",
      icon: XCircle,
      dot: "bg-slate-400"
    }
  };

  const config = configs[status] || {
    label: status || "Unknown",
    bg: "bg-slate-50 text-slate-700 border-slate-200",
    icon: Clock,
    dot: "bg-slate-400"
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
