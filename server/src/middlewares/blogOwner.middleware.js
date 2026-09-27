import { ApiError } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Blog } from "../models/blogs.model.js";

const blogOwner = asyncHandler(async (req,res,next)=>{
    const {id} = req.params;

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Blog Id Is Required.")
    }

    const owner = await Blog.findOne({
        _id:id,
        owner:req.user._id
    })

    if(!owner){
        throw new ApiError(401,"You Are Not Authorized For This Request.")
    }

    req.blog = owner

    next();

})

export {
    blogOwner
}