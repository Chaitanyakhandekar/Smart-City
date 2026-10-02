import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle, trend }) => {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
      accent: "text-blue-600"
    },
    amber: {
      bg: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
      accent: "text-amber-600"
    },
    emerald: {
      bg: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
      accent: "text-emerald-600"
    },
    teal: {
      bg: "bg-teal-50 text-teal-600",
      border: "border-teal-100",
      accent: "text-teal-600"
    },
    rose: {
      bg: "bg-rose-50 text-rose-600",
      border: "border-rose-100",
      accent: "text-rose-600"
    },
    purple: {
      bg: "bg-indigo-50 text-indigo-600",
      border: "border-indigo-100",
      accent: "text-indigo-600"
    }
  };

  const currentStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value !== undefined && value !== null ? value : 0}
            </span>
            {trend && (
              <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold ${trend.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
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
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-slate-50 truncate sm:whitespace-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;

