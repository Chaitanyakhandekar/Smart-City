import React from 'react';
import { Shield, Code, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const AuthLoader = ({ 
  message = "Loading...", 
  submessage = "Please wait while we fetch your data",
  type = "auth" // auth, saving, loading
}) => {
  const getIcon = () => {
    switch(type) {
      case 'auth':
        return <Shield className="w-6 h-6 text-blue-500" />;
      case 'saving':
        return <Code className="w-6 h-6 text-blue-500" />;
      case 'loading':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <Shield className="w-6 h-6 text-blue-500" />;
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]">
      {/* Loader Container */}
      <div className="flex flex-col items-center text-center space-y-6 px-4">
        
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-transparent rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
        </div>

        {/* Content */}
        <div className="space-y-3 max-w-sm">
          <h3 className="text-xl font-semibold text-white">
            {message}
          </h3>
          <p className="text-sm text-slate-400">
            {submessage}
          </p>
        </div>

        {/* Progress Bar */}
        {/* <div className="w-64 bg-slate-800 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
        </div> */}

        {/* DevMark Branding */}
        {/* <div className="flex items-center gap-2 text-slate-500 text-sm pt-4">
          <div className="w-5 h-5 bg-gradient-to-r from-[#4777f4] to-[#5b8def] rounded flex items-center justify-center text-[10px] font-bold text-white">
            {'<>'}
          </div>
          <span>DevMark</span>
        </div> */}
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthLoader;