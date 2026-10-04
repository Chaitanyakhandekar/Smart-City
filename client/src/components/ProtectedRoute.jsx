import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContex";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070B14]">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-3" />
        <p className="text-slate-300 font-medium text-sm">Verifying Smart City credentials...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if attempting to access forbidden route
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "STAFF") return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;