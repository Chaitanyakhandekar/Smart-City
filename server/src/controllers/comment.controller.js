import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { Comment } from "../models/comments.model.js";
import { Blog } from "../models/blogs.model.js";
import mongoose from "mongoose";


const addComment = asyncHandler(async (req,res)=>{
    const {
        blogId,
        content
    } = req.body

    if(!blogId || !mongoose.Types.ObjectId.isValid(blogId)){
        throw new ApiError(400,"Invalid Blog Id.")
    }

    const blog = await Blog.findById(blogId)

    if(!blog){
        throw new ApiError(500,"Blog Not Found.")
    }

    if(!content || (content && content?.trim()==="")){
        throw new ApiError(400,"Content Is Required For Adding Comment.")
    }

    let newComment = await Comment.create({
        blog:blogId,
        owner:req.user._id,
        content:content.trim()
    })

    if(!newComment){
        throw new ApiError(500,"Server Error While Adding Comment.")
    }

    newComment = await newComment.populate("owner","username fullName avatar")

    blog.totalComments += 1;
    await blog.save({validateBeforeSave:false})
    
    return res
        .status(201)
        .json(
            new ApiResponse(201,newComment,"Comment Added Successfully.")
        )
})

const getAllBlogComments = asyncHandler(async (req,res)=>{
    const {id} = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Valid Blog Id Required.")
    }

    const totalComments = await Comment.countDocuments(
        {
            blog:id
        }
    )

    if(totalComments===0){
        return res
            .status(200)
            .json(
                new ApiResponse(200,[],"No Comments On Blog Yet.")
            )
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                blog:new mongoose.Types.ObjectId(id)
            }
        },
        {
            $sort:{createdAt:-1},
        },
        {
            $skip:skip
        },
        {
            $limit:limit
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            position:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                blogId:"$_blog",
                owner:"$owner",
                content:1,
                likes:1,
                createdAt:1,
                updatedAt:1
            }
        }
    ])

    if(!comments.length){
        throw new ApiError(500,"Server Error While Fetching Comments.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,{
                comments,
                totalComments,
                totalPages:Math.ceil(totalComments / limit),
                page,
                limit,
                hasNext: page < Math.ceil(totalComments / limit)
                
            },"Comments Fetched Successfully.")
        )
})


export {
    addComment,
    getAllBlogComments
}