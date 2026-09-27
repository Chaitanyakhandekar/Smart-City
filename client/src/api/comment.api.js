import axios from "axios";

class CommentApi{

    constructor(){
        this.baseUrl = import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV
    }

    async getBlogComments(blogId){
        try {

            const res = await axios.get(
                `${this.baseUrl}/comments/${blogId}`,
                {
                    withCredentials:true
                }
            )
            console.log("Comments = ",res.data.data)
            return {
                success:true,
                data:res.data.data
            }
            
        } catch (error) {
            return {
                success:false,
                message:error.message
            }
        }
    }

    async postComment(commentData){
        try {
            const res = await axios.post(
                `${this.baseUrl}/comments/`,
                 commentData,
                 {
                    withCredentials:true
                 }
            )

            console.log(res.data)

            return {
                success:true,
                data:res.data.data
            }
        } catch (error) {
            return {
                success:false,
                message:error.message
            }
        }
    }


}

export const commentApi = new CommentApi();