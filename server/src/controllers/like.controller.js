import mongoose from "mongoose";
import { Blog } from "../models/blogs.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError, ApiResponse } from "../utils/apiUtils.js"
import { uploadFileOnCloudinary, deleteFileFromCloudinary } from "../services/cloudinary.service.js";
import { User } from "../models/users.model.js";
import { Like } from "../models/likes.model.js";


const toggleBlogLike = asyncHandler(async (req,res)=>{
    const { blogId } = req.body

    console.log("BLOGID = ",blogId)

    if(!blogId || !mongoose.Types.ObjectId.isValid(blogId)){
        throw new ApiError(400,"Invalid Blog ID.")
    }

    const isLikedBefore = await Like.findOne({
        blog:blogId,
        likedBy:req.user._id
    })

    if(!isLikedBefore){

        const newLike = await Like.create({
            blog:blogId,
            likedBy:req.user._id
        })

        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $inc:{totalLikes:1}
            },
            {new:true}
        )

        if(!blog){
            throw new ApiError(500,"Server Error While Like Toggle.")
        }


        return res
            .status(201)
            .json(
                new ApiResponse(201,newLike,"Liked To Blog Successfully.")
            )
    }

    
    isLikedBefore.isLiked = !isLikedBefore.isLiked

    await isLikedBefore.save({validateBeforeSave:false})

    const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $inc:{
                    totalLikes: isLikedBefore.isLiked ? 1 : -1
                }
            },
            {
                new:true
            }
        )

        if(!blog){
            throw new ApiError(500,"Server Error While Removing Like.")
        }


    return res
        .status(200)
        .json(
            new ApiResponse(200,isLikedBefore,`${isLikedBefore.isLiked ? "Liked to Blog Successfully." : "Removed Like From Blog Successfully."}`)
        )
})


const isLikedToBlog = asyncHandler(async(req,res)=>{
    const blogId = req.params.id

    if(!blogId || !mongoose.Types.ObjectId.isValid(blogId)){
        throw new ApiError(400,"Invalid Blog Id.")
    }

    const like = await Like.findOne({
        blog:blogId,
        likedBy:req.user._id,
        isLiked:true
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200,{
                isLiked: like ? true : false
            },
            "Is Liked Check Successfully."
        )
        )
})

export {
    toggleBlogLike,
    isLikedToBlog
}