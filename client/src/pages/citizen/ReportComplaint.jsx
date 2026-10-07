import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import MobileNavBottom from "../../components/MobileNavBottom";
import ChatbotWidget from "../../components/ChatbotWidget";
import { complaintApi, aiApi } from "../../api/client";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  UploadCloud,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Cpu,
  MapPin,
  Send,
  Loader2,
  Check,
  X,
  Compass,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

export const ReportComplaint = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Image & AI, 2: Title & Desc, 3: Location, 4: Review

  // File & Image State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // AI Classification State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Form Fields (Category & Priority are strictly derived from AI)
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  // Title & Description (Step 2)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Location (Step 3)
  const [locationAddress, setLocationAddress] = useState("");
  const [locating, setLocating] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);

  // Image Selection Handler
  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpeg|jpg|png|webp)$/i)) {
      toast.error("Please upload a valid image (JPEG, PNG, or WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please choose a smaller image.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Reset previous AI result and run AI analysis on the selected image
    setAiResult(null);
    setAiError(null);
    analyzeImageWithAI(file);
  };

  // Trigger AI / Gemini Classification
  const analyzeImageWithAI = async (fileToAnalyze) => {
    const targetFile = fileToAnalyze || imageFile;
    if (!targetFile) {
      toast.error("Please upload an image first.");
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const formData = new FormData();
      formData.append("image", targetFile);
      formData.append("description", description || "");

      const res = await aiApi.analyzeImage(formData);
      if (res.data?.data) {
        const result = res.data.data;
        setAiResult(result);
        setCategory(result.category || "Other");
        setSubcategory(result.subcategory || "General Issue");
        setPriority(result.priority || "MEDIUM");

        // Optional pre-fill for title if currently empty
        if (!title && result.subcategory) {
          setTitle(`${result.subcategory} Reported`);
        }

        toast.success(`AI classified: ${result.category} (${result.priority} priority)`);
      } else {
        throw new Error("No classification result returned from server");
      }
    } catch (err) {
      console.warn("AI Classification error:", err.message);
      setAiError("Unable to automatically identify the issue. Please try another image.");
      toast.error("AI could not classify image. Please retry or upload a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setAiResult(null);
    setAiError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // GPS Current Location Detection
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setLocationAddress(data.display_name);
            toast.success("Location pinpointed from GPS!");
          } else {
            setLocationAddress(`Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`);
            toast.success("Coordinates acquired!");
          }
        } catch (err) {
          setLocationAddress(`Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`);
          toast.success("Coordinates acquired!");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        toast.error("Unable to retrieve your location. Please enter manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleNextFromStep1 = () => {
    if (!imageFile) {
      toast.error("Please upload an image first.");
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!title.trim()) {
      toast.error("Please enter a title for the complaint.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide a description of the issue.");
      return;
    }
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!locationAddress.trim()) {
      toast.error("Please provide a location address or landmark.");
      return;
    }
    setCurrentStep(4);
  };

  // Final Submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!title.trim() || !description.trim() || !locationAddress.trim()) {
      toast.error("Please ensure all complaint fields are filled.");
      return;
    }

    if (!imageFile) {
      toast.error("A photograph of the issue is required.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("locationAddress", locationAddress.trim());
      formData.append("category", category || aiResult?.category || "Other");
      formData.append("subcategory", subcategory || aiResult?.subcategory || "General Issue");
      formData.append("priority", priority || aiResult?.priority || "MEDIUM");
      formData.append("image", imageFile);

      if (aiResult) {
        formData.append("aiCategory", aiResult.category || category);
        formData.append("aiSubcategory", aiResult.subcategory || subcategory);
        formData.append("aiConfidence", aiResult.confidence || 0.85);
        formData.append("aiPriority", aiResult.priority || priority);
      }

      const res = await complaintApi.createComplaint(formData);
      const createdComplaint = res.data?.data?.complaint;

      toast.success(`Complaint registered: #${createdComplaint?.complaintNumber || "Success"}`);
      navigate(`/citizen/complaints/${createdComplaint?._id}`);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit complaint. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Upload Photo" },
    { number: 2, label: "Details" },
    { number: 3, label: "Location" },
    { number: 4, label: "Review" }
  ];

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col font-sans text-slate-100 pb-16 md:pb-0">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) setCurrentStep(currentStep - 1);
                else navigate("/citizen/dashboard");
              }}
              className="p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors shadow-xs"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Report an Issue
              </h1>
              <p className="text-xs text-slate-400">
                AI-powered civic grievance registration
              </p>
            </div>
          </div>

          {/* 4-Step Indicator */}
          <div className="bg-[#0F172A] rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between max-w-xl mx-auto mb-2 text-xs font-semibold text-slate-400">
              <span className="text-teal-400 font-bold">Step {currentStep} of {steps.length}</span>
              <span className="text-[11px] bg-slate-900 text-slate-400 px-2.5 py-0.5 rounded-full font-medium border border-slate-800">
                ~1 min estimated
              </span>
            </div>
            <div className="flex items-center justify-between max-w-xl mx-auto relative pt-1">
              <div className="absolute left-6 right-6 top-5 h-1 bg-slate-900 -z-0 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isPassed = currentStep > step.number;
                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => {
                      if (step.number < currentStep) setCurrentStep(step.number);
                    }}
                    className="flex flex-col items-center relative z-10 focus:outline-none group"
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                        isActive
                          ? "bg-teal-500 text-slate-950 ring-4 ring-teal-500/20 shadow-md scale-105"
                          : isPassed
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1.5 font-bold tracking-tight text-center ${
                        isActive ? "text-teal-400" : isPassed ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================ */}
          {/* STEP 1: UPLOAD IMAGE FIRST & AI CLASSIFICATION */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className="bg-[#0F172A] rounded-3xl p-5 sm:p-7 lg:p-8 border border-slate-800 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Upload Incident Photograph
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Our local vision model will inspect visual defect signatures to recommend the department and priority.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold w-fit border border-teal-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>AI-Assisted</span>
                </div>
              </div>

              {/* Upload Box / Image Preview */}
              {!imagePreviewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-slate-700 hover:border-teal-500 bg-slate-900/60 hover:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-16 h-16 rounded-3xl bg-teal-500/15 text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all duration-300 shadow-sm">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-slate-200">
                      Take photo or upload from device
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Supports JPG, PNG, WEBP up to 10MB. Clear close-ups ensure the highest classification accuracy.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* High-Tech HUD Viewfinder */}
                  <div className="relative border-2 border-slate-800 rounded-3xl overflow-hidden bg-slate-950 aspect-video max-h-80 flex items-center justify-center shadow-xl">
                    <img
                      src={imagePreviewUrl}
                      alt="Selected preview"
                      className="w-full h-full object-contain"
                    />

                    {/* Laser Scanning Animation Beam */}
                    {isAnalyzing && (
                      <>
                        <div className="laser-beam animate-scan" />
                        <div className="absolute inset-0 bg-teal-950/20 backdrop-blur-[1px] pointer-events-none" />
                        <div className="absolute inset-0 bg-civic-grid-dark pointer-events-none opacity-40" />
                        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-teal-400/40 text-teal-300 text-xs font-mono backdrop-blur-md shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                          <span>AI SCANNER: ANALYZING PIXELS...</span>
                        </div>
                      </>
                    )}

                    {/* HUD Corner Brackets */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-teal-400/60 pointer-events-none" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-teal-400/60 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-teal-400/60 pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-teal-400/60 pointer-events-none" />

                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-white shadow-lg transition-colors border border-white/20 backdrop-blur-xs z-10"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Manual Analyze Button if not yet analyzed */}
                  {!aiResult && !isAnalyzing && !aiError && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => analyzeImageWithAI(imageFile)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Analyze Image with AI
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AI ANALYZING SPINNER */}
              {isAnalyzing && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/30 flex items-center gap-3 text-teal-300 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Neural Vision Model Processing...</p>
                    <p className="text-[11px] text-teal-300/80">Identifying civic defect signature, category, and severity priority rating...</p>
                  </div>
                </div>
              )}

              {/* AI SUCCESSFUL CLASSIFICATION CARD */}
              {aiResult && !isAnalyzing && (
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-teal-500/30 space-y-4 shadow-xl animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-teal-300 font-extrabold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Defect Confirmed by AI Vision</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-teal-400 rounded-full"
                          style={{ width: `${Math.round((aiResult.confidence || 0.85) * 100)}%` }}
                        />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-xs">
                        {Math.round((aiResult.confidence || 0.85) * 100)}% Match
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</span>
                      <p className="font-extrabold text-white mt-1 text-xs sm:text-sm truncate">{aiResult.category}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subcategory</span>
                      <p className="font-extrabold text-white mt-1 text-xs sm:text-sm truncate">{aiResult.subcategory || "General Issue"}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Priority</span>
                      <p className={`font-extrabold mt-1 text-xs sm:text-sm truncate ${
                        aiResult.priority === "HIGH" ? "text-rose-400" : aiResult.priority === "MEDIUM" ? "text-amber-400" : "text-teal-400"
                      }`}>
                        {aiResult.priority || "MEDIUM"}
                      </p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Triage</span>
                      <p className="font-extrabold text-emerald-400 mt-1 text-xs sm:text-sm truncate">Auto-Assigned</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleNextFromStep1}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      Continue to Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* AI FAILURE CARD */}
              {aiError && !isAnalyzing && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-300 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    {aiError}
                  </div>
                  <p className="text-xs text-amber-200/80">
                    The photo could not be classified with certainty. Please upload a clearer close-up photograph of the issue.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => analyzeImageWithAI(imageFile)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Analysis
                    </button>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="px-4 py-2 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-900/40"
                    >
                      Replace Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: TITLE + DESCRIPTION */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Tell us about the issue
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Give your complaint a concise title and details to guide field crews.
                </p>
              </div>

              {/* AI Detection Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-teal-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-400 font-semibold">AI Detected:</span>
                  <span className="font-extrabold text-teal-300">
                    {category} → {subcategory}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                  {priority} Priority
                </span>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pothole near school gate"
                  className="w-full px-4 py-3 bg-[#070B14] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Description *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {description.length}/500
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Large pothole near the school entrance. It is dangerous for vehicles and pedestrians."
                  className="w-full px-4 py-3 bg-[#070B14] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: LOCATION */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Location & Area Landmark *
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provide exact streets, area name, or nearby landmark for field inspectors.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  Address / Nearby Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g. North Avenue, Sector 4 (Near Metro Station)"
                  className="w-full px-4 py-3 bg-[#070B14] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Use Current Location Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locating}
                  className="px-4 py-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4 text-teal-400" />}
                  {locating ? "Acquiring GPS Location..." : "Use Device GPS Location"}
                </button>
                <span className="text-[11px] text-slate-500">
                  Auto-detects GPS coordinates for priority routing
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">Dispatch Notice:</span> Municipal response crews prioritize complaints with verified area landmarks and GPS coordinates.
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  Continue to Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: REVIEW & SUBMIT */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Review Complaint
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm the details below before submitting to municipal operations.
                </p>
              </div>

              {/* Review Summary Card */}
              <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900 space-y-4">
                {/* Image Preview */}
                {imagePreviewUrl && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Uploaded Photo
                    </span>
                    <div className="mt-1.5 w-36 h-28 rounded-xl overflow-hidden border border-slate-800 shadow-2xs">
                      <img
                        src={imagePreviewUrl}
                        alt="Complaint proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* AI Classification Block */}
                <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> AI Classification
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Category</p>
                      <p className="font-bold text-white">{category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Subcategory</p>
                      <p className="font-bold text-white">{subcategory || "General"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Confidence</p>
                      <p className="font-bold text-teal-300">{Math.round((aiResult?.confidence || 0.85) * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Priority</p>
                      <p className="font-bold text-amber-400">{priority}</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Title
                  </span>
                  <p className="text-sm font-semibold text-white mt-0.5">{title}</p>
                </div>

                {/* Description */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{description}</p>
                </div>

                {/* Location */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </span>
                  <p className="text-xs font-semibold text-teal-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    {locationAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <ChatbotWidget />
      <MobileNavBottom />
    </div>
  );
};

export default ReportComplaint;
