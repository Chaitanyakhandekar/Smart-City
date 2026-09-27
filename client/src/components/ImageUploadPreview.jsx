import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export const ImageUploadPreview = ({
  onImageChange,
  required = false,
  label = "Upload Complaint Photograph"
}) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpeg|jpg|png|webp|svg|gif)$/i)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WEBP, SVG).");
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please upload a smaller image.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      if (onImageChange) onImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onImageChange) onImageChange(null, null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {!preview ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Click to upload or drag & drop photo
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPG, JPEG, PNG, or WEBP (Max 10MB)
          </p>
        </div>
      ) : (
        <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 aspect-video max-h-64 flex items-center justify-center">
          <img
            src={preview}
            alt="Upload Preview"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {fileName}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;
