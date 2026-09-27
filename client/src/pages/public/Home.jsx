import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SmartCityLogo from "../../components/SmartCityLogo";
import heroCityscape from "/hero-cityscape.jpg";
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
  Check,
  Sparkles,
  Activity
} from "lucide-react";
import { api } from "../../api/client";

export const Home = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState("");
  const [realStats, setRealStats] = useState(null);

  useEffect(() => {
    // Attempt to load real statistics from backend if user has an active session
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/complaints/dashboard")
        .then((res) => {
          if (res.data?.data?.stats) {
            setRealStats(res.data.data.stats);
          }
        })
        .catch(() => {
          api.get("/admin/dashboard")
            .then((res) => {
              if (res.data?.data?.stats) {
                setRealStats(res.data.data.stats);
              }
            })
            .catch(() => { });
        });
    }
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

      {/* HERO SECTION WITH CINEMATIC SMART CITY TWILIGHT BACKDROP */}
      <section className="relative overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center bg-slate-950">
        {/* City Skyline Background Image covering entire hero */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[position:65%_center] sm:bg-center"
          style={{ backgroundImage: `url(${heroCityscape})` }}
        >
          {/* Desktop/Tablet Directional Dark Overlay:
              Darker on left for crisp text contrast, clear on right to preserve sunset, skyline, bridge & river lights */}
          <div
            className="absolute inset-0 hidden sm:block pointer-events-none"
            style={{
              background: `linear-gradient(90deg, rgba(5, 15, 35, 0.93) 0%, rgba(8, 20, 45, 0.82) 35%, rgba(8, 20, 45, 0.40) 65%, rgba(8, 20, 45, 0.08) 100%)`
            }}
          />

          {/* Mobile Overlay: Vertical gradient for clear readability with glowing waterfront bottom */}
          <div
            className="absolute inset-0 sm:hidden pointer-events-none"
            style={{
              background: `linear-gradient(180deg, rgba(5, 15, 35, 0.94) 0%, rgba(8, 20, 45, 0.82) 55%, rgba(8, 20, 45, 0.45) 100%)`
            }}
          />

          {/* Subtle Bottom Transition Gradient into the next section */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 35%, rgba(5, 15, 35, 0.45) 100%)`
            }}
          />

          {/* Decorative Smart City Network Dots on left darkened portion (5-8% opacity) */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-1/2 pointer-events-none opacity-[0.06] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-white">
              {/* Civic Tag Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-xs font-semibold text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Next-Gen Civic Governance Platform</span>
              </div>

              {/* Headline with responsive clamp sizing */}
              <h1 className="text-white font-extrabold tracking-tight leading-[1.12] text-[clamp(2.4rem,5vw,4.25rem)]">
                A Cleaner, <br />
                <span className="text-[#38BDF8]">Safer, Smarter City</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-200/90 max-w-xl leading-relaxed font-normal">
                Report civic issues, track progress and help us build a better city together. Powered by real-time computer vision AI and verified on-site field resolutions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/citizen/report"
                  className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/40 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  Report a Complaint
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#track-section"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/25 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Track Complaint
                </a>
              </div>

              {/* Feature Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#38BDF8]" /> AI Vision Powered
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Real-time Tracking
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Verified Proofs
                </span>
              </div>
            </div>

            {/* Right Column: Real Stats Cards if available, or subtle live grid indicator */}
            {realStats ? (
              <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 w-full max-w-lg lg:max-w-xs">
                  {/* Real Total Complaints */}
                  <div className="bg-slate-900/60 hover:bg-slate-900/75 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Total</p>
                      <span className="p-1 sm:p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/20 flex-shrink-0">
                        <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    </div>
                    <p className="text-lg sm:text-2xl font-extrabold text-white mt-1">{realStats.total ?? 0}</p>
                  </div>

                  {/* Real Resolved */}
                  <div className="bg-slate-900/60 hover:bg-slate-900/75 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Resolved</p>
                      <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/20 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    </div>
                    <p className="text-lg sm:text-2xl font-extrabold text-white mt-1">{realStats.resolved ?? 0}</p>
                  </div>

                  {/* Real In Progress */}
                  <div className="bg-slate-900/60 hover:bg-slate-900/75 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">In Progress</p>
                      <span className="p-1 sm:p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/20 flex-shrink-0">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    </div>
                    <p className="text-lg sm:text-2xl font-extrabold text-white mt-1">{realStats.inProgress ?? 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* When no real stats are present, keep the right side clear so the beautiful sunset, skyline, bridge and river lights are fully visible */
              <div className="lg:col-span-5 hidden lg:flex flex-col items-end justify-end pointer-events-none">
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-right max-w-xs shadow-lg">
                  <div className="flex items-center gap-2 justify-end text-xs font-bold text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Municipal Grid Active</span>
                  </div>
                  <p className="text-[11px] text-slate-300/80 mt-1">
                    24/7 AI-assisted automated triage and municipal field dispatch
                  </p>
                </div>
              </div>
            )}
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
