import axios from "axios";

class FollowApi {
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/followers`
    }

    async followUser(id){
        try {
            const response = await axios.post(
                `${this.baseUrl}/follow/${id}`,
                {},
                {
                   withCredentials:true
                }
            )

            console.log("Follow Api Response 2 :: ",response.data)

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

    async unfollowUser(id){
        try {
            const response = await axios.post(
                `${this.baseUrl}/unfollow/${id}`,
                {},
                {
                   withCredentials:true
                }
            )

            console.log("Follow Api Response 2 :: ",response.data)

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


    async getFollowStatus(id){
        try {
            const response = await axios.get(
                `${this.baseUrl}/is-followed/${id}`,
                {
                    withCredentials:true
                }
            )

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
}

export const followApi = new FollowApi()