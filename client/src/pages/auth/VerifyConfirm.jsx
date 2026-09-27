import axios from "axios";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyConfirm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [email, setEmail] = React.useState(localStorage.getItem("emailForVerification") || "");

    useEffect(()=>{
        setEmail(localStorage.getItem("emailForVerification") || "");
    },[])

    const handleVerifyEmail = async() => {
        // Logic to verify email
        setLoading(true);
        const res = await axios.get(`https://devmark-8het.onrender.com/api/v1/users/email/is-verify/${email}`)
        console.log(res.data);
        setLoading(false);
        if(res.data.isVerified){
            // localStorage.removeItem("emailForVerification");
            navigate("/user/feed");
        }else{
            setError("Email verification failed. Please try again.");
        }
    };

   return(
    <div className="h-[100vh] w-[100vw] bg-[#030712] flex justify-center items-center">
        <div className="bg-[#111827] w-full max-w-md p-5 text-white font-mono flex flex-col justify-between items-center gap-6 rounded-md m-3">
            <h1 className="text-2xl font-extrabold text-center">Verify Your Email</h1>
            <p className="text-gray-400 text-sm text-center"> We've sent a verification link to <span className="text-blue-400">{email}</span>.
          Please check your inbox (and spam folder) to complete verification.</p>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
          onClick={handleVerifyEmail}
          className="bg-[#2563eb] text-white text-md font-bold font-mono p-3 rounded-md">I have Verified My Email</button>
        </div>
    </div>
   )
};

export default VerifyConfirm;
