import mongoose from "mongoose";
import { Blog } from "../models/blogs.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError, ApiResponse } from "../utils/apiUtils.js"
import { uploadFileOnCloudinary, deleteFileFromCloudinary } from "../services/cloudinary.service.js";
import { User } from "../models/users.model.js";
import { Like } from "../models/likes.model.js";
import { Save } from "../models/saves.model.js";


const toggleBlogSave = asyncHandler(async (req, res) => {
    const blogId = req.params.id

    if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
        throw new ApiError(400, "Invalid BlogId")
    }

    const isSavedBefore = await Save.findOne({
        blog: blogId,
        user: req.user._id
    })

    if (!isSavedBefore) {

        const newSave = await Save.create({
            blog: blogId,
            user: req.user._id
        })

        if (!newSave) {
            throw new ApiError(500, "Server Error While Saving Blog")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, newSave, "Blog Saved Successfully.")
            )
    }

    isSavedBefore.isSaved = !isSavedBefore.isSaved
    await isSavedBefore.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, isSavedBefore, `${!isSavedBefore.isSaved ? "Blog Unsaved Successfully." : "Blog Saved Successfully."}`)
        )
})


const isSavedToBlog = asyncHandler(async (req, res) => {
    const blogId = req.params.id

    if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
        throw new ApiError(400, "Invalid BlogId")
    }

    const isSaved = await Save.findOne({
        blog: blogId,
        user: req.user._id,
        isSaved: true
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, isSaved, `${isSaved ? "Blog is Saved." : "Blog is Not Saved."}`)
        )
})


const getAllSavedBlogsOfUser = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit

    const totalBlogs = await Save.countDocuments({
        user: new mongoose.Types.ObjectId(userId),
        isSaved: true
    })

    if(totalBlogs===0){
        return res
        .status(200)
        .json(
            new ApiResponse(200, {
                blogs: [],
                page,
                limit,
                totalBlogs,
                totalPages: Math.ceil(totalBlogs / limit)
            }, "No Saved Blogs Found.")
        )
    }

    const savedBlogs = await Save.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                isSaved: true
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "blogs",
                localField: "blog",
                foreignField: "_id",
                as: "blogDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $addFields:{
                                        isOwner:{
                                            $eq:["$_id",new mongoose.Types.ObjectId(userId)]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                        totalFollowers: 1,
                                        isOwner:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: "$owner"
                    },
                    {
                        $lookup:{
                            from:"follows",
                            let:{blogOwnerId:"$owner._id"},
                            pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                            $and:[
                                                {$eq:["$followTo","$$blogOwnerId"]},
                                                {$eq:["$followedBy", new mongoose.Types.ObjectId(userId)]}
                                            ]
                                        }
                                    }
                                }
                            ],
                            as:"isFollowedDocs"
                        }
                    },
                    {
                        $addFields:{
                            "owner.isFollowed":{
                                $cond:{
                                    if:{$gt:[{$size:"$isFollowedDocs"},0]},
                                    then:true,
                                    else:false
                                }
                            }
                        }
                    }
                ]
                
            },
            
        },
        {
            $unwind: "$blogDetails"
        },
        {
            $replaceRoot:{newRoot:"$blogDetails"}
        }
       
        

    ])

    console.log("Saved Blogs: ", savedBlogs);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                blogs:savedBlogs,
                page,
                limit,
                totalBlogs,
                totalPages:Math.ceil(totalBlogs/limit),
                hasNext:page < Math.ceil(totalBlogs/limit)
            },
             "Saved Blogs Fetched Successfully.")
        )
})

export {
    toggleBlogSave,
    isSavedToBlog,
    getAllSavedBlogsOfUser
}