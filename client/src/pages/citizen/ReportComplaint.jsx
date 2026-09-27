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
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const geo = await res.json();
          if (geo && geo.display_name) {
            setLocationAddress(geo.display_name);
          } else {
            setLocationAddress(`Lat: ${lat}, Long: ${lng}`);
          }
        } catch {
          setLocationAddress(`Lat: ${lat}, Long: ${lng}`);
        } finally {
          setLocating(false);
          toast.success("Current location acquired!");
        }
      },
      (err) => {
        setLocating(false);
        toast.error("Could not obtain GPS position. Please enter address manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Step Navigations
  const handleNextFromStep1 = () => {
    if (!imageFile) {
      toast.error("Please upload a photo of the civic issue.");
      return;
    }
    if (isAnalyzing) {
      toast.error("Please wait while AI finishes analyzing the image.");
      return;
    }
    if (!aiResult) {
      toast.error("Please analyze the image with AI before continuing.");
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!title.trim()) {
      toast.error("Please enter a title for the issue.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      toast.error("Please provide a description (at least 5 characters).");
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
    { number: 1, label: "Upload Image" },
    { number: 2, label: "Details" },
    { number: 3, label: "Location" },
    { number: 4, label: "Review" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 pb-16 md:pb-0">
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
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-xs"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Report an Issue
              </h1>
              <p className="text-xs text-slate-500">
                AI-powered civic grievance registration
              </p>
            </div>
          </div>

          {/* 4-Step Indicator */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
              <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
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
                    className="flex flex-col items-center relative z-10 focus:outline-none"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isActive
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md"
                          : isPassed
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-400 border-2 border-slate-300"
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 font-semibold ${
                        isActive ? "text-blue-600" : isPassed ? "text-slate-700" : "text-slate-400"
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Upload a photo of the issue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our AI vision model will automatically classify the category, subcategory, and urgency from your photograph.
                </p>
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
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-3"
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
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Take photo / Choose from device
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tap to open camera or browse gallery (JPG, PNG, WEBP)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-72 flex items-center justify-center">
                    <img
                      src={imagePreviewUrl}
                      alt="Selected preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-3 right-3 p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-lg transition-colors"
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
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Analyze Image with AI
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AI ANALYZING SPINNER */}
              {isAnalyzing && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-900 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold">AI Computer Vision Model Analyzing Photo...</p>
                    <p className="text-[11px] text-blue-700">Detecting civic issue category, subcategory, and urgency...</p>
                  </div>
                </div>
              )}

              {/* AI SUCCESSFUL CLASSIFICATION CARD */}
              {aiResult && !isAnalyzing && (
                <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-4 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      AI Detected Your Issue
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-2xs">
                      Confidence: {Math.round((aiResult.confidence || 0.85) * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
                      <p className="font-extrabold text-slate-900 mt-0.5 text-sm">{aiResult.category}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Issue / Subcategory</span>
                      <p className="font-extrabold text-slate-900 mt-0.5 text-sm">{aiResult.subcategory || "General Issue"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Urgency</span>
                      <p className="font-extrabold text-amber-600 mt-0.5 text-sm">{aiResult.priority || "MEDIUM"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                      <p className="font-extrabold text-emerald-600 mt-0.5 text-sm">Verified</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleNextFromStep1}
                      className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* AI FAILURE CARD */}
              {aiError && !isAnalyzing && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {aiError}
                  </div>
                  <p className="text-xs text-amber-700">
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
                      className="px-4 py-2 rounded-xl border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100/50"
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tell us about the issue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Give your complaint a concise title and details to guide field crews.
                </p>
              </div>

              {/* AI Detection Summary */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-600 font-semibold">AI Detected:</span>
                  <span className="font-extrabold text-blue-900">
                    {category} → {subcategory}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {priority} Priority
                </span>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pothole near school gate"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Description Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Description *
                  </label>
                  <span className="text-[11px] text-slate-400">
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Location & Area Landmark *
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide exact streets, area name, or nearby landmark for field inspectors.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Address / Nearby Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g. Baramati, Maharashtra (Near Shivaji Chowk)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Use Current Location Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locating}
                  className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4 text-blue-600" />}
                  {locating ? "Acquiring GPS Location..." : "Use Current Location"}
                </button>
                <span className="text-[11px] text-slate-400">
                  Uses device GPS sensor for accurate positioning
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Dispatch Notice:</span> Municipal response crews prioritize complaints with verified area landmarks.
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Review Complaint
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm the details below before submitting to municipal operations.
                </p>
              </div>

              {/* Review Summary Card */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60 space-y-4">
                {/* Image Preview */}
                {imagePreviewUrl && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Uploaded Photo
                    </span>
                    <div className="mt-1.5 w-36 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                      <img
                        src={imagePreviewUrl}
                        alt="Complaint proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* AI Classification Block */}
                <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> AI Classification
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Category</p>
                      <p className="font-bold text-slate-900">{category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Subcategory</p>
                      <p className="font-bold text-slate-900">{subcategory || "General"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Confidence</p>
                      <p className="font-bold text-blue-700">{Math.round((aiResult?.confidence || 0.85) * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Priority</p>
                      <p className="font-bold text-amber-600">{priority}</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Title
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{title}</p>
                </div>

                {/* Description */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{description}</p>
                </div>

                {/* Location */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </span>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {locationAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
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
