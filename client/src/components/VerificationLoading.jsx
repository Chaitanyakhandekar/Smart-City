// VerificationLoading.jsx
import React from "react";

const VerificationLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 font-inter">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center animate-fadeIn">
        {/* Animated Spinner */}
        <div className="flex justify-center mb-4">
          <svg
            className="animate-spin h-12 w-12 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="status"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold mb-2">
          Verifying Your Account...
        </h1>
        <p className="text-gray-400">
          Please wait while we confirm your verification token.
        </p>
      </div>
    </div>
  );
};

export default VerificationLoading;
