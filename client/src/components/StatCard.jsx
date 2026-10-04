import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle, trend }) => {
  const colorStyles = {
    blue: {
      bg: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
      accent: "text-sky-400"
    },
    amber: {
      bg: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      accent: "text-amber-400"
    },
    emerald: {
      bg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      accent: "text-emerald-400"
    },
    teal: {
      bg: "bg-teal-500/15 text-teal-400 border border-teal-500/30",
      accent: "text-teal-400"
    },
    rose: {
      bg: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      accent: "text-rose-400"
    },
    purple: {
      bg: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
      accent: "text-purple-400"
    }
  };

  const currentStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-[#0F172A]/90 rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-800 shadow-md hover:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
            {title}
          </p>
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {value !== undefined && value !== null ? value : 0}
            </span>
            {trend && (
              <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold ${trend.startsWith("-") ? "text-rose-400" : "text-emerald-400"}`}>
                {trend.startsWith("-") ? <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" /> : <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />}
                {trend}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${currentStyle.bg}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-slate-800/80 truncate sm:whitespace-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;

