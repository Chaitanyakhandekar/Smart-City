import React, { use } from "react";
import Input from "../../components/Input";
import axios from "axios"
import Swal from 'sweetalert2';
import { Link, useNavigate } from "react-router-dom";
import AuthLoader from "../../components/AuthLoader";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  UserCheck, 
  Code,
  ArrowRight,
  Github,
  Chrome,
  Loader,
  CheckCircle2,
  Shield
} from 'lucide-react';

function Signup() {

    const navigate = useNavigate();

    const [user, setUser] = React.useState({
        username: "",
        fullName: "",
        email: "",
        password: ""
    });
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [emailSent, setEmailSent] = React.useState(false);
    const [error, setError] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const clearForm = () => {
        setUser({
            username: "",
            fullName: "",
            email: "",
            password: ""
        });
        setConfirmPassword("");
    }

    const onChangeHandler = (e) => {
        setUser({...user , [e.target.name] : e.target.value })
    }

    React.useEffect(() => {
        if (emailSent) {
           navigate("/verify-confirm");
        }
    }, [emailSent]);

    const onSubmitHandler = async() => {
        localStorage.setItem("emailForVerification", user.email);

        if(user.password !== confirmPassword){
            setError("Passwords do not match");
            return;
        }

        clearForm();
        setLoading(true);
        const res = await axios.post(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/users/register`,user)

        if(res.data.success){
           setEmailSent(true)
            Swal.fire({
                          title: 'Email Verification',
                          text: `Verification Link Sent on ${user.email}`,
                          icon: 'success',
                          confirmButtonText: 'Ok',
                          timer: 2000,
                          showConfirmButton: false,
                          position: 'top-end',
                          toast: true
                            });
        }
        else{
          setError(res.data.message);
          setLoading(false);
        }

        console.log("Response from server: ", res.data);
    }

    if(loading){
        return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="backdrop-blur-xl bg-gray-800/30 border border-gray-700/50 p-12 rounded-2xl max-w-md w-full text-center shadow-2xl relative z-10">
                
                {/* Animated Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                            <Mail className="h-12 w-12 text-white animate-bounce" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-3 text-white">
                    Sending Verification Link
                </h1>
                <p className="text-gray-400 mb-2 text-lg">
                    Hold tight! We're delivering a secure link to your email.
                </p>
                <p className="text-blue-400 text-sm flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Check your inbox (and spam folder)
                </p>

                {/* Loading Dots */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex justify-center items-center p-4 relative overflow-hidden">

            {/* Animated Background Blobs */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md relative z-10">
                
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-r from-[#4777f4] to-[#9035ea] p-3 rounded-xl shadow-lg">
                            <Code className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4777f4] to-[#9035ea] text-transparent bg-clip-text">
                            DevMark
                        </h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                    <p className="text-gray-400">Join the developer community today</p>
                </div>

                {/* Form Card */}
                <div className="backdrop-blur-xl bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                    
                    <div className="space-y-5">
                        
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-300 block">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                </div>
                                <input
                                    className="w-full bg-gray-900/50 border border-gray-700 focus:border-blue-500 text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={user.username}
                                    onChange={onChangeHandler}
                                    name="username"
                                />
                            </div>
                        </div>

                        {/* Full Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium text-gray-300 block">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserCheck className="text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                </div>
                                <input
                                    className="w-full bg-gray-900/50 border border-gray-700 focus:border-blue-500 text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={user.fullName}
                                    onChange={onChangeHandler}
                                    name="fullName"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-300 block">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                </div>
                                <input
                                    className="w-full bg-gray-900/50 border border-gray-700 focus:border-blue-500 text-white pl-12 pr-4 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={user.email}
                                    onChange={onChangeHandler}
                                    name="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-300 block">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                </div>
                                <input
                                    className="w-full bg-gray-900/50 border border-gray-700 focus:border-blue-500 text-white pl-12 pr-12 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    value={user.password}
                                    onChange={onChangeHandler}
                                    name="password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-300 block">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                </div>
                                <input
                                    className="w-full bg-gray-900/50 border border-gray-700 focus:border-blue-500 text-white pl-12 pr-12 py-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    name="confirm-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-400 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-center gap-2">
                                <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={onSubmitHandler}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#4777f4] to-[#9035ea] hover:from-[#5887ff] hover:to-[#a045fa] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Sign In Link */}
                        <div className="text-center pt-4 border-t border-gray-700/50">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    )
}

export default Signup;