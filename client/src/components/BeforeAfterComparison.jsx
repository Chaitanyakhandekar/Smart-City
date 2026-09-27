import React, { useState } from "react";
import { getImageUrl } from "../api/client";
import { Maximize2, X, CheckCircle, Clock } from "lucide-react";

export const BeforeAfterComparison = ({ beforeImage, afterImage, progressImages = [] }) => {
  const [activeModalImage, setActiveModalImage] = useState(null);

  const beforeUrl = beforeImage?.imageUrl ? getImageUrl(beforeImage.imageUrl) : null;
  const afterUrl = afterImage?.imageUrl ? getImageUrl(afterImage.imageUrl) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE IMAGE CARD */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              <Clock className="w-3.5 h-3.5" /> BEFORE RESOLUTION
            </span>
            <span className="text-xs text-slate-500">Citizen Submission</span>
          </div>

          <div className="relative group rounded-xl overflow-hidden bg-slate-200 aspect-video flex items-center justify-center">
            {beforeUrl ? (
              <>
                <img
                  src={beforeUrl}
                  alt="Before Resolution"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => setActiveModalImage({ url: beforeUrl, title: "Before Resolution" })}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-sm font-medium"
                >
                  <Maximize2 className="w-5 h-5" /> Enlarge Photo
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-500">No before image provided</p>
            )}
          </div>
        </div>

        {/* AFTER IMAGE CARD */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" /> AFTER RESOLUTION
            </span>
            <span className="text-xs text-slate-500">Municipal Verification</span>
          </div>

          <div className="relative group rounded-xl overflow-hidden bg-slate-200 aspect-video flex items-center justify-center">
            {afterUrl ? (
              <>
                <img
                  src={afterUrl}
                  alt="After Resolution"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => setActiveModalImage({ url: afterUrl, title: "After Resolution" })}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-sm font-medium"
                >
                  <Maximize2 className="w-5 h-5" /> Enlarge Photo
                </button>
              </>
            ) : (
              <div className="text-center p-4 text-slate-500">
                <p className="text-xs font-medium">Resolution photo pending</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Field staff will upload proof of work upon task completion.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Images if any */}
      {progressImages && progressImages.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Interim Field Work Photos ({progressImages.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {progressImages.map((prog, i) => {
              const url = getImageUrl(prog.imageUrl);
              return (
                <div
                  key={prog._id || i}
                  onClick={() => setActiveModalImage({ url, title: `Work In Progress #${i + 1}` })}
                  className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-video cursor-pointer border border-slate-200"
                >
                  <img src={url} alt={`Progress ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    View
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Zoom Preview */}
      {activeModalImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-white">
              <span className="text-sm font-semibold">{activeModalImage.title}</span>
              <button
                onClick={() => setActiveModalImage(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[75vh]">
              <img
                src={activeModalImage.url}
                alt={activeModalImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterComparison;
