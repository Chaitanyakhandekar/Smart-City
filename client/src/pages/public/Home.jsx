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
  Check,
  Sparkles,
  Activity,
  Layers,
  AlertTriangle,
  Eye,
  Shield,
  Users,
  ArrowUpRight,
  Droplets,
  Trash2,
  Lightbulb,
  Trees
} from "lucide-react";
import { api } from "../../api/client";

export const Home = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState("");
  const [realStats, setRealStats] = useState(null);
  const [activeHeroTab, setActiveHeroTab] = useState("ai"); // 'ai', 'dispatch', 'proof'
  const [selectedDept, setSelectedDept] = useState(0);

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

  const sampleTrackIds = ["SC2025001234", "SC-9821", "SC-4402"];

  // Department explorer data with distinct soothing colors
  const departments = [
    {
      id: "roads",
      name: "Roads & Infrastructure",
      icon: Wrench,
      accent: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      sla: "< 24 Hours",
      crews: "14 Active Field Crews",
      description: "Potholes, broken footpaths, damaged road dividers, manhole covers, and road surfacing repairs.",
      examples: ["Potholes & craters", "Damaged guard rails", "Unpaved road edges", "Broken pedestrian paths"],
      metric: "98.2% on-time fix"
    },
    {
      id: "sanitation",
      name: "Sanitation & Waste",
      icon: Trash2,
      accent: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      sla: "< 12 Hours",
      crews: "28 Sweeper & Bin Units",
      description: "Overflowing garbage dumps, uncollected residential waste, illegal debris dumping, and street cleanliness.",
      examples: ["Dumpster overflow", "Construction debris", "Littered sidewalks", "Bio-waste alerts"],
      metric: "4.8/5 Cleanliness Score"
    },
    {
      id: "water",
      name: "Water Supply & Drainage",
      icon: Droplets,
      accent: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      sla: "< 8 Hours (High Priority)",
      crews: "9 Rapid Plumbing Vans",
      description: "Underground pipeline bursts, low water pressure, contaminated supply, storm drain clogs, and sewer backflow.",
      examples: ["Main pipeline leaks", "Open sewer hazards", "Drainage blockages", "Water contamination"],
      metric: "99.4% leak containment"
    },
    {
      id: "lighting",
      name: "Street Lighting & Power",
      icon: Lightbulb,
      accent: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      sla: "< 18 Hours",
      crews: "6 Electrical Bucket Trucks",
      description: "Non-functional street lamps, dangling overhead wires, exposed electric junction boxes, and blackout sectors.",
      examples: ["Dark street stretches", "Faulty solar lights", "Exposed wiring", "Damaged light poles"],
      metric: "100% safety certified"
    },
    {
      id: "parks",
      name: "Parks & Urban Greenery",
      icon: Trees,
      accent: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      sla: "< 36 Hours",
      crews: "5 Horticultural Squads",
      description: "Fallen tree limbs obstructing roads, overgrown public gardens, broken children playground equipment, and public benches.",
      examples: ["Fallen tree blockage", "Broken swing sets", "Damaged garden fences", "Overgrown hedges"],
      metric: "96.5% satisfaction"
    }
  ];

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100 antialiased selection:bg-teal-500 selection:text-slate-950">
      <Navbar />

      {/* HERO SECTION WITH CINEMATIC TWILIGHT SKYLINE */}
      <section className="relative overflow-hidden min-h-[620px] lg:min-h-[700px] flex items-center bg-[#070B14]">
        {/* City Skyline Background Image covering entire hero */}
        <div className="absolute inset-0 z-0 hero-bg">
          {/* Directional Dark Overlays */}
          <div
            className="absolute inset-0 hidden sm:block pointer-events-none"
            style={{
              background: `linear-gradient(90deg, rgba(7, 11, 20, 0.96) 0%, rgba(10, 15, 29, 0.90) 42%, rgba(10, 15, 29, 0.65) 75%, rgba(10, 15, 29, 0.35) 100%)`
            }}
          />

          <div
            className="absolute inset-0 sm:hidden pointer-events-none"
            style={{
              background: `linear-gradient(180deg, rgba(7, 11, 20, 0.97) 0%, rgba(10, 15, 29, 0.90) 55%, rgba(10, 15, 29, 0.70) 100%)`
            }}
          />

          {/* Ambient Soothing Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

          {/* Network Dots */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-1/2 pointer-events-none opacity-[0.06] bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Bottom Gradient Transition into Next Section */}
          <div
            className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 10%, #0B1120 100%)`
            }}
          />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-white">
              {/* Civic Tag Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 backdrop-blur-md text-xs font-semibold text-teal-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>AI-Assisted Municipal Governance 2.0</span>
              </div>

              {/* Headline */}
              <h1 className="text-white font-extrabold tracking-tight leading-[1.12] text-[clamp(2.5rem,5.5vw,4.5rem)]">
                A Cleaner, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300">
                  Safer, Smarter City
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                Report civic issues in seconds. Our autonomous computer vision AI categorizes hazards, auto-dispatches municipal crews, and verifies repairs on-site with photographic proof.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/citizen/report"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  Report a Complaint
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#track-section"
                  className="px-7 py-4 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm sm:text-base border border-slate-700 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  Track Live Status
                </a>
              </div>

              {/* Feature Badges with soothing slate pills */}
              <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xs">
                  <Cpu className="w-3.5 h-3.5 text-teal-400" /> YOLOv8 + Gemini AI
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xs">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Live GPS Dispatch
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Verified On-Site Proof
                </span>
              </div>
            </div>

            {/* Right Column: Live Interactive Municipal Grid & AI Triage Simulator */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
              <div className="w-full max-w-md bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden group">
                {/* Decorative Top Accent Glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />

                {/* Card Header: Grid Pulse */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div>
                      <h4 className="text-xs font-bold tracking-wide uppercase text-slate-200">Municipal Grid Live</h4>
                      <p className="text-[10px] text-slate-400">Sector 04 • Autonomous AI Triage</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    24/7 ONLINE
                  </span>
                </div>

                {/* Interactive Mode Switcher */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl my-4 text-[11px] font-semibold">
                  <button
                    onClick={() => setActiveHeroTab("ai")}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                      activeHeroTab === "ai"
                        ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    1. AI Vision
                  </button>
                  <button
                    onClick={() => setActiveHeroTab("dispatch")}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                      activeHeroTab === "dispatch"
                        ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    2. Dispatch
                  </button>
                  <button
                    onClick={() => setActiveHeroTab("proof")}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                      activeHeroTab === "proof"
                        ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    3. Proof
                  </button>
                </div>

                {/* Dynamic Content based on Tab */}
                {activeHeroTab === "ai" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 flex-shrink-0">
                            <Cpu className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Vision Engine</span>
                            <p className="text-xs font-bold text-white">Hazard Class: Severe Pothole</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                          98.4% Match
                        </span>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Confidence: High</span>
                        <span className="text-amber-400 font-medium">Auto-Priority: HIGH</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Citizen uploads a photo &rarr; Local AI detects defects, determines priority, and verifies authenticity without human delay.
                    </p>
                  </div>
                )}

                {activeHeroTab === "dispatch" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">PWD Road Crew 07</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                          En Route (18 min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="truncate">Near Central Junction, North Avenue</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Instant departmental assignment with GPS geotagging. Crew receives mobile task dispatch notification immediately.
                    </p>
                  </div>
                )}

                {activeHeroTab === "proof" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Verified
                        </span>
                        <span className="text-[10px] text-slate-400">Fixed in 14h 20m</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-rose-400 font-bold block mb-1">BEFORE</span>
                          <span className="text-slate-400">Reported Oct 03</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-emerald-500/30">
                          <span className="text-emerald-400 font-bold block mb-1">AFTER</span>
                          <span className="text-slate-200">Photographic Proof</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Field staff must upload post-resolution evidence. Citizens retain the power to confirm case closure or reopen anytime.
                    </p>
                  </div>
                )}

                {/* Footer Micro-Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Avg SLA</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white">&lt; 24 Hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Resolved</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-400">
                      {realStats?.resolved ? `${realStats.resolved}+` : "1,420+"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Satisfaction</span>
                    <span className="text-xs sm:text-sm font-extrabold text-teal-300">98.6%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 FEATURE BENTO GRID (SOOTHING DARK SLATE) */}
      <section id="features" className="py-16 sm:py-24 bg-[#0B1120] border-b border-slate-800 relative text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
              Platform Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-3 tracking-tight">
              Designed for Citizen Trust & Speed
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Every civic complaint undergoes transparent automated triage, verified assignment, and photographic validation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento Card 1: 1-Click Reporting */}
            <div className="card-hover-lift rounded-3xl bg-[#0F172A] p-7 border border-slate-800 hover:border-teal-500/40 relative group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all duration-300 shadow-sm">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-500/10 text-[10px] font-bold text-teal-300 uppercase tracking-wider mb-2 border border-teal-500/20">
                  Citizen Mobile & Web
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Effortless Reporting
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Snap a photo from your phone or desktop. Auto-detects geolocation and uploads securely in under 30 seconds.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
                <span>Start report flow</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Bento Card 2: AI Vision Classification */}
            <div className="card-hover-lift rounded-3xl bg-[#0F172A] p-7 border border-slate-800 hover:border-indigo-500/40 relative group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Cpu className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2 border border-indigo-500/20">
                  Computer Vision
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Automated AI Triage
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Advanced vision models classify hazard severity, subcategory, and eliminate duplicate reports automatically.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Explore AI specs</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Bento Card 3: Real-Time Transparency */}
            <div className="card-hover-lift rounded-3xl bg-[#0F172A] p-7 border border-slate-800 hover:border-sky-500/40 relative group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300 shadow-sm">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[10px] font-bold text-sky-300 uppercase tracking-wider mb-2 border border-sky-500/20">
                  Live Transparency
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Milestone Tracking
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Follow your complaint at every step. Receive SMS & in-app alerts as field crews are dispatched and work begins.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
                <span>Track an issue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Bento Card 4: Verified On-Site Proof */}
            <div className="card-hover-lift rounded-3xl bg-[#0F172A] p-7 border border-slate-800 hover:border-emerald-500/40 relative group flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-2 border border-emerald-500/20">
                  Citizen Power
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Before/After Proof
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  No fake closures. Staff must submit high-res resolution photos. If the work is incomplete, reopen with 1 tap.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Resolution standards</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEPARTMENT TRIAGE EXPLORER (DARK SLATE) */}
      <section className="py-16 sm:py-24 bg-[#070B14] border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Municipal Operations Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Explore Municipal Service Departments
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Select a department below to inspect live response standards, dedicated field units, and issue classifications.
              </p>
            </div>
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-sm w-fit"
            >
              <span>Submit General Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Department Pills / Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {departments.map((dept, index) => {
              const Icon = dept.icon;
              const isSelected = selectedDept === index;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(index)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-teal-500 text-slate-950 font-bold border-teal-500 shadow-md"
                      : "bg-[#0F172A] text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-slate-950" : "text-teal-400"}`} />
                  <span>{dept.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Department Showcase Card */}
          {departments[selectedDept] && (
            <div className="bg-[#0F172A] rounded-3xl border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xl animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${departments[selectedDept].accent}`}>
                      Target SLA: {departments[selectedDept].sla}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {departments[selectedDept].crews}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {departments[selectedDept].metric}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {departments[selectedDept].name}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {departments[selectedDept].description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Common Issues Handled by this Unit:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {departments[selectedDept].examples.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      to="/citizen/report"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
                    >
                      Report an issue in this department
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-6 text-white space-y-4 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-teal-400">DISPATCH PROTOCOL</span>
                    <span className="text-[10px] text-slate-400 font-mono">AUTOMATED</span>
                  </div>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p>Visual verification & severity rating via AI Vision Engine.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p>Nearest available crew dispatched based on geographic ward GPS.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p>Resolution photograph stamped with timestamp and GPS coordinate.</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Escalation Threshold</span>
                      <span className="font-bold text-amber-400">Automatic at 80% SLA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TRACK COMPLAINT SECTION (DARK SLATE) */}
      <section id="track-section" className="py-16 sm:py-24 bg-[#0B1120] border-b border-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
            Citizen Transparency Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Track Any Complaint in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Enter your complaint reference number or token ID to inspect real-time progress, assigned field officers, and resolution photos.
          </p>

          <form onSubmit={handleTrackSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. SC2025001234 or Complaint ID"
                className="w-full px-4 py-3.5 pl-11 bg-[#0F172A] border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 min-h-[46px] rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              Track Status
            </button>
          </form>

          {/* Quick Sample IDs */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Quick test examples:</span>
            {sampleTrackIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTrackId(id)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-medium border border-slate-700 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / MUNICIPAL LIFECYCLE (DARK SLATE) */}
      <section id="how-it-works" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
            End-to-End Governance
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-3 tracking-tight">
            How The Civic Platform Works
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Transparent, verified resolution from report submission to citizen confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-[#0F172A] rounded-3xl p-8 border border-slate-800 shadow-xl relative group hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold text-lg mb-6 shadow-md shadow-teal-500/20">
              1
            </div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">STAGE 01</span>
            <h3 className="text-lg font-bold text-white mb-2">
              Citizen Reports & AI Triage
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload a photograph of the issue (pothole, garbage, pipeline leak). Our local computer vision model analyzes visual features and description to automatically recommend the department, subcategory, and priority level.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0F172A] rounded-3xl p-8 border border-slate-800 shadow-xl relative group hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-extrabold text-lg mb-6 shadow-md shadow-indigo-500/20">
              2
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">STAGE 02</span>
            <h3 className="text-lg font-bold text-white mb-2">
              Admin Review & Staff Dispatch
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              City administrators review AI classifications with the ability to override priorities or categories. The complaint is dispatched directly to qualified field officers in the matching department with GPS coordinates.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0F172A] rounded-3xl p-8 border border-slate-800 shadow-xl relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-lg mb-6 shadow-md shadow-emerald-500/20">
              3
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">STAGE 03</span>
            <h3 className="text-lg font-bold text-white mb-2">
              Before / After Resolution Proof
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Field staff execute repairs on site and are required to upload an "AFTER" resolution photograph. Citizens review the side-by-side comparison to either confirm case closure or reopen with specific feedback.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="mt-auto bg-[#050811] text-slate-400 py-12 sm:py-16 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <SmartCityLogo variant="light" size="md" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <Link to="/citizen/report" className="hover:text-teal-400 transition-colors">Report Issue</Link>
              <Link to="/citizen/complaints" className="hover:text-teal-400 transition-colors">Track Status</Link>
              <Link to="/login" className="hover:text-teal-400 transition-colors">Staff Portal</Link>
              <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-teal-400 transition-colors">How It Works</a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© {new Date().getFullYear()} Smart City Civic Grievance Management System. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Municipal Governance Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
