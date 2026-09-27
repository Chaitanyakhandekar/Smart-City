import axios from "axios";

const logout = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_ENV === "production" ?  import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/users/logout`,
            {
                withCredentials:true
            }
        )
        console.log("Logout response :: ",res.data.data)
    } catch (error) {
        console.log("Error during logout:", error);
    }
}

export {logout};