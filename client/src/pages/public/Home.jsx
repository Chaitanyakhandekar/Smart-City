import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SmartCityLogo from "../../components/SmartCityLogo";
import {
  Camera,
  Cpu,
  MapPin,
  Zap,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  ShieldCheck,
  Building2,
  Check
} from "lucide-react";
import { api } from "../../api/client";

export const Home = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState("");
  const [stats, setStats] = useState({
    total: "12,458",
    resolved: "9,214",
    inProgress: "2,456"
  });

  useEffect(() => {
    api.get("/health").catch(() => {});
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackId.trim()) {
      navigate(`/citizen/complaints/${trackId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />

      {/* HERO SECTION WITH CITY SKYLINE TWILIGHT BACKDROP */}
      <section className="relative overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* City Skyline Background Image with Deep Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2400&q=85"
            alt="Smart City Skyline"
            className="w-full h-full object-cover object-center"
          />
          {/* Deep Navy/Black Gradient Overlay matching reference aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-900/60 backdrop-blur-[1px]"></div>
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Actions */}
            <div className="lg:col-span-7 space-y-6 text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                A Cleaner, <br />
                <span className="text-blue-400">Safer, Smarter City</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                Report civic issues, track progress and help us build a better city together. Powered by real-time computer vision AI and verified on-site field resolutions.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/citizen/report"
                  className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  Report a Complaint <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#track-section"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/25 backdrop-blur-md transition-all flex items-center gap-2"
                >
                  Track Complaint
                </a>
              </div>
            </div>

            {/* Right Column: Floating Stats Cards (matching reference design) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm space-y-3.5">
                {/* Total Complaints */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Total Complaints
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {stats.total}
                    </p>
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> ↑ 12%
                    </p>
                  </div>
                  {/* Mini Bar Chart SVG */}
                  <div className="flex items-end gap-1.5 h-12 px-2">
                    <span className="w-2 h-5 bg-blue-200 rounded-sm"></span>
                    <span className="w-2 h-7 bg-blue-300 rounded-sm"></span>
                    <span className="w-2 h-10 bg-blue-500 rounded-sm"></span>
                    <span className="w-2 h-12 bg-blue-600 rounded-sm"></span>
                  </div>
                </div>

                {/* Resolved */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Resolved
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {stats.resolved}
                    </p>
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> ↑ 18%
                    </p>
                  </div>
                  {/* Mini Bar Chart SVG */}
                  <div className="flex items-end gap-1.5 h-12 px-2">
                    <span className="w-2 h-6 bg-emerald-200 rounded-sm"></span>
                    <span className="w-2 h-8 bg-emerald-300 rounded-sm"></span>
                    <span className="w-2 h-10 bg-emerald-500 rounded-sm"></span>
                    <span className="w-2 h-12 bg-emerald-600 rounded-sm"></span>
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      In Progress
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {stats.inProgress}
                    </p>
                    <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> ↑ 5%
                    </p>
                  </div>
                  {/* Mini Bar Chart SVG */}
                  <div className="flex items-end gap-1.5 h-12 px-2">
                    <span className="w-2 h-4 bg-amber-200 rounded-sm"></span>
                    <span className="w-2 h-6 bg-amber-300 rounded-sm"></span>
                    <span className="w-2 h-9 bg-amber-400 rounded-sm"></span>
                    <span className="w-2 h-11 bg-amber-500 rounded-sm"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 FEATURE CARDS ROW (matching reference design bottom bar) */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Report Easily */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Report Easily
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit complaints with photos in seconds from mobile or web.
              </p>
            </div>

            {/* Card 2: AI Powered */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                AI Powered
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatic categorization, priority rating, and duplicate detection.
              </p>
            </div>

            {/* Card 3: Real-time Tracking */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-13 h-13 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Real-time Tracking
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track status of your complaints through every resolution milestone.
              </p>
            </div>

            {/* Card 4: Faster Resolution */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Faster Resolution
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Collaborating departments working together for a cleaner city.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRACK COMPLAINT SECTION */}
      <section id="track-section" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Citizen Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Track Your Complaint Progress
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Have a complaint reference number? Enter it below to check current status, assigned field officers, and repair updates.
          </p>

          <form onSubmit={handleTrackSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. SC2025001234 or ID"
                className="w-full px-4 py-3 pl-11 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all whitespace-nowrap"
            >
              Track Now
            </button>
          </form>
        </div>
      </section>

      {/* HOW IT WORKS / MUNICIPAL LIFECYCLE */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            End-to-End Governance
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-1">
            How The Civic Platform Works
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Transparent, verified resolution from report submission to citizen confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Citizen Reports & AI Analyzes
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload a photograph of the issue (pothole, garbage, pipeline leak). Our local computer vision model analyzes visual features and description to automatically recommend the department, subcategory, and priority level.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Admin Review & Staff Assignment
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              City administrators review AI classifications with the ability to override priorities or categories. The complaint is dispatched directly to qualified field officers in the matching department.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Before / After Resolution Proof
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Field staff execute repairs on site and are required to upload an "AFTER" resolution photograph. Citizens review the side-by-side comparison to either confirm case closure or reopen with specific feedback.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="mt-auto bg-[#0F172A] text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <SmartCityLogo variant="light" size="md" />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <Link to="/citizen/report" className="hover:text-white transition-colors">Report Issue</Link>
              <Link to="/citizen/complaints" className="hover:text-white transition-colors">Track Status</Link>
              <Link to="/login" className="hover:text-white transition-colors">Officer Portal</Link>
              <a href="#about" className="hover:text-white transition-colors">How It Works</a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© {new Date().getFullYear()} Smart City Civic Grievance Management System. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Municipal Governance Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
