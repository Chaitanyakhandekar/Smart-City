import React from "react";
import { AlertTriangle, AlertOctagon, ShieldAlert, ArrowDown } from "lucide-react";

export const PriorityBadge = ({ priority }) => {
  const configs = {
    LOW: {
      label: "Low",
      bg: "bg-slate-800 text-slate-300 border-slate-750",
      icon: ArrowDown
    },
    MEDIUM: {
      label: "Medium",
      bg: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      icon: AlertTriangle
    },
    HIGH: {
      label: "High Priority",
      bg: "bg-amber-500/15 text-amber-300 border-amber-500/30 font-semibold",
      icon: AlertOctagon
    },
    CRITICAL: {
      label: "CRITICAL",
      bg: "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold animate-pulse",
      icon: ShieldAlert
    }
  };

  const config = configs[priority] || {
    label: priority || "Normal",
    bg: "bg-slate-800 text-slate-300 border-slate-700",
    icon: AlertTriangle
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs border ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
