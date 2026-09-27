// VerificationSuccess.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Success from "../../components/Success";
import { use } from "react";
import VerificationLoading from "../../components/VerificationLoading";
import axios from "axios";
import { useParams } from "react-router-dom";

const Verify = () => {
  const navigate = useNavigate();
  const [sec,setSec] = React.useState(3);
  const { id } = useParams();
  const [isVerified, setIsVerified] = React.useState(false);

  useEffect(() => {

    (async function verifyEmail() {
      console.log("Verifying email with id:", id);
        const res = await  axios.get(`https://devmark-8het.onrender.com/api/v1/users/email/verify/${id}`);
      setIsVerified(true);
    })();

  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/user/feed");
    }, 4000);

    const interval = setInterval(() => {
      setSec((prev) => (prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    }; // cleanup to prevent memory leaks
  }, [isVerified]);

  if (!isVerified) {
    return <VerificationLoading />;
  }

  return (
    <div className="bg-[#111827] w-min-screen h-[100vh] flex justify-center items-center">
        <div className="bg-[#1f2937] w-[95%] sm:w-[60%] md:w-[50%] 2xl:w-[40%] h-[45%] rounded-xl flex flex-col justify-around items-center p-3">
            <Success/>
            <h1 className="text-xl 2xl:text-2xl text-center font-mono text-white">Email Verified Successfully ✅</h1>
            <p className="text-gray-400 text-sm 2xl:text-lg font-mono text-center">
            You will be automatically navigated to the login page.
            </p>

            <p className="text-blue-400 font-mono text-center text-sm 2xl:text-lg">Redirecting in {sec} seconds...</p>
        </div>
    </div>
  );
};

export default Verify;
