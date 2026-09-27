import { Follow } from "../models/follow.model.js";
import { User } from "../models/users.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";


const followUser = asyncHandler(async(req,res)=>{
    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid User Id.")
    }

    const isAlreadyFollowing = await Follow.findOne({
        followTo:id,
        followedBy:req.user._id
    })

    if(isAlreadyFollowing){
        return res
            .status(200)
            .json(
                new ApiResponse(200,{isFollowed:true},"Already Followed")
            )
    }

    const follow = await Follow.create({
        followTo:id,
        followedBy:req.user._id
    })

    if(!follow){
        throw new ApiError(500,"Server Error In Follow Request.")
    }

    const followToUser = await User.findByIdAndUpdate(
        id,
        {
            $inc:{totalFollowers:1}
        },
        {new:true}
    )

    const followedByUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $inc:{
                totalFollowing:1
            }
        },
        {
            new:true
        }
    )

    if(!(followToUser && followedByUser)){
        throw new ApiError(500,"Server Error In Follow Request.")
    }

    return res.status(200).json(new ApiResponse(201,"Followed Successfully."))
})


const unfollowUser = asyncHandler(async(req,res)=>{
    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Valid User Id Is Required.")
    }

    const unfollow = await Follow.findOneAndDelete({
        followTo:id,
        followedBy:req.user._id
    })

    if(!unfollow){
        throw new ApiError(400,"You Are Not Following This User.")
    }

    const decrementedFollower = await User.findByIdAndUpdate(
        id,
        {
            $inc:{totalFollowers:-1}
        },
        {
            new:true
        }
    )

    const decrementFollowing = await User.findByIdAndUpdate(
        req.user._id,
        {
            $inc:{totalFollowing:-1}
        },
        {
            new:true
        }
    )

    if(!(decrementedFollower && decrementFollowing)){
        throw new ApiError(500,"Server Error In Unfollow Request.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,"Unfollowed Successfully.")
        )
})


const getFollowStatus = asyncHandler(async (req,res)=>{
    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Valid User Id Is Required.")
    }

    const isFollowed = await Follow.findOne({
        followTo:id,
        followedBy:req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200,{
                isFollowed:isFollowed ? true : false
            },"Follow Status Fetched Successfully.")
        )
})


export {
    followUser,
    unfollowUser,
    getFollowStatus
}