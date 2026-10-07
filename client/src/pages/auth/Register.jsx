import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContex";
import Navbar from "../../components/Navbar";
import SmartCityLogo from "../../components/SmartCityLogo";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    setLoading(false);

    if (result.success) {
      navigate("/citizen/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans relative overflow-hidden text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <SmartCityLogo size="lg" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Citizen Registration
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join your municipal community to report and track local resolutions
            </p>
          </div>

          <div className="bg-[#0F172A]/95 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070B14] border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rahul@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070B14] border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070B14] border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070B14] border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Registration <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Already registered?{" "}
                <Link to="/login" className="font-semibold text-teal-400 hover:text-teal-300 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
