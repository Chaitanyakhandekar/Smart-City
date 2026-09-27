import React from "react";
import { AlertTriangle, AlertOctagon, ShieldAlert, ArrowDown } from "lucide-react";

export const PriorityBadge = ({ priority }) => {
  const configs = {
    LOW: {
      label: "Low",
      bg: "bg-slate-100 text-slate-700 border-slate-200",
      icon: ArrowDown
    },
    MEDIUM: {
      label: "Medium",
      bg: "bg-blue-100 text-blue-700 border-blue-200",
      icon: AlertTriangle
    },
    HIGH: {
      label: "High Priority",
      bg: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
      icon: AlertOctagon
    },
    CRITICAL: {
      label: "CRITICAL",
      bg: "bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse",
      icon: ShieldAlert
    }
  };

  const config = configs[priority] || {
    label: priority || "Normal",
    bg: "bg-gray-100 text-gray-700 border-gray-200",
    icon: AlertTriangle
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs border ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
