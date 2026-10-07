import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContex";
import Navbar from "../../components/Navbar";
import SmartCityLogo from "../../components/SmartCityLogo";
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Briefcase,
  User,
  Loader2,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = (userRole) => {
    const from = location.state?.from?.pathname;
    if (from && !from.includes("/login") && !from.includes("/register")) {
      navigate(from, { replace: true });
      return;
    }

    if (userRole === "ADMIN") navigate("/admin/dashboard", { replace: true });
    else if (userRole === "STAFF") navigate("/staff/dashboard", { replace: true });
    else navigate("/citizen/dashboard", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      redirectAfterLogin(result.user.role);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans relative overflow-hidden text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-md w-full">
          {/* Header Card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <SmartCityLogo size="lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Smart City
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Unified Civic Grievance & Municipal Operations Portal
            </p>
          </div>

          {/* Quick Demo Fill Buttons (For Quick Evaluation) */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-3xl p-4 sm:p-4.5 mb-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
              <span className="flex items-center gap-1.5 font-bold text-teal-400">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> 1-Click Evaluation Accounts
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Auto-fills Form</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin@smartcity.local", "Admin@123")}
                className="px-2 py-2.5 min-h-[44px] rounded-2xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/30 text-[11px] font-bold text-purple-200 transition-all flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("staff@smartcity.local", "Staff@123")}
                className="px-2 py-2.5 min-h-[44px] rounded-2xl bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/30 text-[11px] font-bold text-amber-200 transition-all flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Staff</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("citizen@smartcity.local", "Citizen@123")}
                className="px-2 py-2.5 min-h-[44px] rounded-2xl bg-teal-950/30 hover:bg-teal-900/50 border border-teal-500/30 text-[11px] font-bold text-teal-200 transition-all flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="w-4 h-4 text-teal-400" />
                <span>Citizen</span>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#0F172A]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070B14] border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070B14] border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                New citizen?{" "}
                <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300 hover:underline">
                  Register citizen account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;