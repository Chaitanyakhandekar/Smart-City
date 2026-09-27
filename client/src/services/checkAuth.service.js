import axios from "axios";

const checkAuth = async ()=>{
        const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/users/is-logged-in`,
      {
        withCredentials:true,
        headers:{
          "x-auth-check-type" : "login-check-hit"
        }
      }
    )

   return res.data;

}

export {checkAuth};