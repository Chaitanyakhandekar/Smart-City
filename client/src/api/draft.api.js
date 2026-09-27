import axios from "axios";

class DraftApi{
    constructor(){
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL_DEV}/drafts`;
    }

    async createDraft(draftData,images=[]){
        try {
            const formData = new FormData();

            for(const key in draftData){
                formData.append(key,draftData[key]);
            }

            images.forEach((image)=>{
                formData.append("images",image);
            })

            const response = await axios.post(
                `${this.baseUrl}/`,
                formData,
                {
                    withCredentials:true,
                    Headers:{
                        "Content-Type":"multipart-form-data",
                    }
                }
            )

            // console.log("Create Draft API Response = ",response.data)

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

    async getAllUserDrafts(){
        try {
            const response = await axios.get(
                `${this.baseUrl}/user-drafts`,
                {
                    withCredentials:true
                }
            )

            console.log("Get All User Drafts API Response = ",response.data)

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

    async getDraftById(id){
        try {
            console.log("Draft ID : ",id)
            const response = await axios.get(
                `${this.baseUrl}/${id}`,
                {
                    withCredentials:true
                }
            )
            console.log("Get Draft Data............................ ",response.data)

            return {
                success:true,
                data:response.data.data
            }
        } catch (error) {

            console.log("Publish Draft Blopg :: Error :: ",error)
            return {
                success:false,
                message:error.message,
                error:error
            }
        }
    }

    async deleteDraft(id){
        try {
            const response = await axios.delete(
                `${this.baseUrl}/${id}`,
                {
                    withCredentials:true
                }
            )
            console.log("Delete Draft Response :: ",response)

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
}

export const draftApi = new DraftApi();