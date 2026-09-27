import React from "react";
import { Link } from "react-router-dom";

export const SmartCityLogo = ({ variant = "dark", size = "md", to = "/" }) => {
  const isLight = variant === "light"; // light text for dark navy sidebars
  
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const content = (
    <div className="inline-flex items-center gap-2.5 group select-none">
      {/* Connected Smart City Hex Node Symbol matching reference */}
      <div className={`${iconSizes[size] || iconSizes.md} relative flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="20" cy="10" r="5" fill="#3B82F6" />
          <circle cx="10" cy="26" r="5" fill="#0D9488" />
          <circle cx="30" cy="26" r="5" fill="#2563EB" />
          <circle cx="20" cy="21" r="3.5" fill="#10B981" />
          <path d="M20 10L10 26M20 10L30 26M10 26L30 26" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" opacity="0.6"/>
          <path d="M20 10L20 21M10 26L20 21M30 26L20 21" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight ${textSizes[size] || textSizes.md} ${isLight ? "text-white" : "text-slate-900"}`}>
          Smart<span className="text-blue-600">City</span>
        </span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="flex items-center">{content}</Link>;
  }

  return content;
};

export default SmartCityLogo;
