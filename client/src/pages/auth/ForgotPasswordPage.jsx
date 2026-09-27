import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { userApi } from "../../api/user.api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP & new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace with your actual API call
      const res = await userApi.sendPasswordResetOTP({ email });
      
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: 'Check your email for the OTP code',
          timer: 1500
        });
        setStep(2);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: res.data.message || 'Could not send OTP',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.',
      });
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match',
      });
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual API call
      const res = await userApi.resetPassword({ email, otp, newPassword });
      
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Password Reset',
          text: 'Your password has been reset successfully',
          timer: 1500
        });
        navigate('/login');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: res.message || 'Could not reset password',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Something went wrong. Please try again.`,
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F111A] flex items-center justify-center px-4 font-mono relative z-10">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md rounded-2xl shadow-lg p-8 border-2 border-gray-800 backdrop-blur-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          DevMark <span className="text-[#00D8FF]">🚀</span>
        </h1>
        <p className="text-center text-gray-400 mb-6">Reset Your Password</p>

        {step === 1 ? (
          <form className="space-y-5" onSubmit={handleSendOTP}>
            <div>
              <label className="text-gray-300 block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-[#00D8FF]"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={email === "" || loading}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-[#4777f4] to-[#9035ea] text-white font-semibold hover:opacity-90 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="text-blue-600 w-6 h-6 border-2 border-t-gray-600 border-r-gray-600 border-gray-800 animate-spin rounded-3xl"></div>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            <div>
              <label className="text-gray-300 block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-2">OTP Code</label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-[#00D8FF]"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-[#00D8FF]"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-[#00D8FF]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={otp === "" || newPassword === "" || confirmPassword === "" || loading}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-[#4777f4] to-[#9035ea] text-white font-semibold hover:opacity-90 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="text-blue-600 w-6 h-6 border-2 border-t-gray-600 border-r-gray-600 border-gray-800 animate-spin rounded-3xl"></div>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 rounded-lg border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 transition"
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-[#00D8FF] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}