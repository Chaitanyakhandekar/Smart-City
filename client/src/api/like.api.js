import axios from "axios";

class LikeApi{

    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/likes`
    }

    async toggleBlogLike(blogId){
        try {
            console.log("Blog id 2 = ",blogId)
            const response = await axios.post(
                `${this.baseUrl}/`,
                {blogId},
                {
                    withCredentials:true
                }
            )

            console.log("Like Toggle Response = ",response.data)
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

    async isLikedToBlog(blogId){
        try {

            const response = await axios.get(
                `${this.baseUrl}/is-liked/${blogId}`,
                {
                    withCredentials:true
                }
            )

            return {
                success:true,
                data:response.data.data
            }            
        } catch (error) {
            return{
                success:false,
                message:error.message,
                error:error
            }
        }
    }
}

export const likeApi = new LikeApi()