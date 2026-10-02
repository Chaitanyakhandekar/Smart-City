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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full">
          {/* Header Card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <SmartCityLogo size="lg" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Smart City
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Unified Civic Grievance & Municipal Operations Portal
            </p>
          </div>

          {/* Quick Demo Fill Buttons (For Quick Evaluation) */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 sm:p-4 mb-6 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-2.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 1-Click Evaluation Accounts
              </span>
              <span className="text-[10px] text-blue-500 font-medium">Pre-fills Credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin@smartcity.local", "Admin@123")}
                className="px-2 py-2 sm:py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-blue-100/50 border border-blue-200 text-[11px] font-semibold text-slate-700 hover:text-blue-900 transition-colors flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("staff@smartcity.local", "Staff@123")}
                className="px-2 py-2 sm:py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-blue-100/50 border border-blue-200 text-[11px] font-semibold text-slate-700 hover:text-blue-900 transition-colors flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>Staff</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("citizen@smartcity.local", "Citizen@123")}
                className="px-2 py-2 sm:py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-blue-100/50 border border-blue-200 text-[11px] font-semibold text-slate-700 hover:text-blue-900 transition-colors flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>Citizen</span>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                New citizen?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:underline">
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