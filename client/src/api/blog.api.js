import axios from "axios";

class BlogApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/blogs`
    }

    async createBlog(formData){
        try {
            const response = await axios.post(
                `${this.baseUrl}/create`,
                formData,
                {
                    withCredentials:true,
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            )

            return{
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

    async updateBlog(blogId,blogData){
         try {
            
         } catch (error) {
            
         }
    }

    async deleteBlog(id){
        try {
            const response = axios.delete(
                `${this.baseUrl}/${id}`,
                {
                    withCredentials:true
                }
            )

            console.log("Blog Deleted Successfully :::: ",response.data)

            return {
                success:true,
                data:response.data
            }
        } catch (error) {
            return {
                success:false,
                message:error.messgae,
                error:error
            }
        }
    }

    async getBlogById(blogId){
        try {
            const response = await axios.get(
                `${this.baseUrl}/${blogId}`,
                {
                    withCredentials:true
                }
            )

            console.log("Fetched Blog by ID Response = ",response.data.data)

            return {
                success:true,
                data:response.data.data
            }


            // return response.data
        } catch (error) {
            console.error("Error fetching blog by ID:", error)
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }
}

export const blogApi = new BlogApi();