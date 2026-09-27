import axios from "axios";

class UserApi {

    constructor() {
        this.baseUrl = import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV;
    }

    
    async signupUser(user) {
        try {
            const res = await axios.post(`${this.baseUrl}/users/register`, user)

            return {
                success: true,
                data: res.data
            };
        } catch (error) {
            console.log("Signup User :: Error :: ", error.message)
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

    async loginUser(user) {
        try {
            console.log("User API Login User :: ",user)
            const res = await axios
                .post(`${this.baseUrl}/users/login
                `,
                    user,
                    {
                        withCredentials: true
                    }
                )

            console.log("data Login = ", res.data)
            return {
                success: true,
                data: res.data
            }
        } catch (error) {
            console.log("Login User :: Error :: ", error.message)
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

    async sendPasswordResetOTP(email){
        try {
            const response = await axios.post(
                `${this.baseUrl}/users/password/reset/otp`,
                email 
            )

            console.log("Send Password Reset OTP API Response = ",response.data)

            return {
                success:true,
                data:response.data
            }
        } catch (error) {
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

    async resetPassword(data){
        try {
            const response = await axios.post(
                `${this.baseUrl}/users/password/reset`,
                data
            )

            console.log("Reset Password API Response = ",response.data)

            return {
                success:true,
                data:response.data
            }
        } catch (error) {
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }
    

    async logoutUser() {
        try {
            const res = await axios
                .get(`${this.baseUrl}/users/logout
                `,
                    {
                        withCredentials: true
                    }
                )

            console.log("data = ", res.data)
            return {
                success: true,
                data: res.data
            }
        } catch (error) {
            console.log("Logout User :: Error :: ", error.message)
            return error
        }
    }

    async fetchUserProfile(){
        try {
            const res = await axios.get(
                `${this.baseUrl}/users/profile`,
                {
                    withCredentials:true
                }
            )

            console.log("response of Profile = ",res.data.data)

            return {
                success:true,
                data:res.data.data
            }
        } catch (error) {
            console.log("Fetch User Profile :: ERROR :: ",error.message)
            return {
                success:false,
                error:error.message
            }
        }
    }

    async updateUserProfile(profileData){
        try {

            const res = await axios.patch(
                `${this.baseUrl}/users/profile`,
                profileData,
                {
                    withCredentials:true
                }
            )

            if(res.data.success){
                return {
                    success:true,
                    data:res.data.data
                }
            }

            console.log("update Data response = ",res.data)
            
        } catch (error) {
            console.log("Update User Profile :: ERROR :: ",error.message)
            return{
                success:false,
                message:error.message
            }
        }
    }

    async updateUserAvatar(data){
        try {
            const res = await axios.patch(`
                    ${this.baseUrl}/users/avatar
                `,
                data,
                {
                    withCredentials:true,
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            )

            if(!res.data.success){
                throw new Error("Update Avatar Failure.")
            }

            console.log("Avatar Update ",res.data)

            return {
                success:true,
                data:res.data
            }
        } catch (error) {
            return {
                success:false,
                error:error.message
            }
        }
    }

    async fetchUserAvatar(){
        try {
            const response = await axios.get(
                `${this.baseUrl}/users/avatar`,
                {
                    withCredentials:true
                }
            )

            return {
                success:true,
                data:response.data
            }

        } catch (error) {
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

    async isLoggedInUser(){
        try {
            const response = await axios.get(
                `${this.baseUrl}/users/is-logged-in`,
                {
                    withCredentials:true
                }
            )
            console.log("Is Logged In User API Response = ",response.data)
            return {
                success:true,
                data:response.data.data
            }
        } catch (error) {
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

    async deleteUserAvatar(){
        try {
            const response = await axios.delete(
                `${this.baseUrl}/users/avatar`,
                {
                    withCredentials:true,
                    headers:{
                        "x-delete-only":"true"
                    }
                }
            )

            console.log("Delete User Avatar API Response = ",response.data)
        } catch (error) {
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

}

export const userApi = new UserApi();