import mongoose from "mongoose";
import { Blog } from "../models/blogs.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError, ApiResponse } from "../utils/apiUtils.js"
import { uploadFileOnCloudinary, deleteFileFromCloudinary } from "../services/cloudinary.service.js";
import { User } from "../models/users.model.js";
import { Draft } from "../models/draft.model.js";

const createDraft = asyncHandler(async (req, res) => {

  const {
    title,
    content,
    category,
    tags,
  } = req.body

 if([title,content,category].every(field => !field || field.trim() === "") && (!tags || !Array.isArray(tags) || tags.length === 0) && (!req.files || req.files.length === 0)){
    throw new ApiError(400,"At least one field (title, content, category, tags, images) must be provided to create a draft")
  }

  console.log("Image Files ::::::::::::::::::: ",req.files)

  let images = req.files
 
  let imgs = new Array();

  if (req.files && req.files.length > 0) {
      imgs = images ? await Promise.all(
    images.map(async (image) => {
      const res = await uploadFileOnCloudinary(image.path)
      imgs.push({
        url: res.secure_url,
        public_id: res.public_id
      })
      return {
        url: res.secure_url,
        public_id: res.public_id
      }
    })
  ) : [].then(() => {
    console.log("Uploaded Images", imgs)
  }).catch((err) => {
    throw new ApiError(500, "Image Upload Failed: " + err.message)
  })
  }

  let draft = {}

  if(title && title.trim() !== ""){
    draft.title = title.trim();
  }
    if(content && content.trim() !== ""){
    draft.content = content.trim();
  }
    if(category && category.trim() !== ""){
    draft.category = category.trim();
  }
    if(tags && Array.isArray(tags) && tags.length > 0){
    draft.tags = tags;
  }
   

  const newDraft = await Draft.create({...draft,owner:req.user._id,images:imgs})

  if (!newDraft) {
    throw new ApiError(500, "Draft Creation Failed")
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, newDraft, "Draft Created Successfully")
    )

})


const getAllUserDrafts = asyncHandler(async (req,res)=>{
   const userId = new mongoose.Types.ObjectId(req.user._id);

   const totalDrafts = await Draft.countDocuments({owner:req.user._id})

   if(totalDrafts===0){
    return res
      .status(200)
      .json(
        new ApiResponse(200,[], "No Drafts Found for the User")
      )
   }

   const drafts = await Draft.aggregate([
    {
      $match:{
        owner:userId
      }
    },
    {
      $sort:{createdAt:-1}
    },
    {
      $project:{
        __v:0,
        owner:0
      }
    }
   ])

   if(!drafts){
    throw new ApiError(500,"Failed to Fetch User Drafts")
   }

   return res
    .status(200)
    .json(
      new ApiResponse(200,drafts, "User Drafts Fetched Successfully")
    )
})


const getDraftById = asyncHandler(async (req,res)=>{
  const draftId = req.draft._id

  if(!draftId || !mongoose.Types.ObjectId.isValid(draftId)){
    throw new ApiError(400,"Invalid Draft Id.")
  }

  const draft = await Draft.findById(draftId)

  if(!draft){
    throw new ApiError(500,"Server Error While Fetching Draft.")
  }

  return res
      .status(200)
      .json(
        new ApiResponse(200,draft,"Draft Fetched Successfully.")
      )
})


const deleteDraft = asyncHandler(async (req,res)=>{
  const draftId = req.params.id

  if(!draftId || !mongoose.Types.ObjectId.isValid(draftId)){
    throw new ApiError(400,"Valid Draft Id Required.")
  }

  const draft = await Draft.findById(draftId)

  if(!draft){
    throw new ApiError(400,"Draft With Given Id Doesnt Exists.")
  }

  if(draft.images.length){
    await Promise.all(
      draft.images.map(async(image)=>{
        await deleteFileFromCloudinary(image.public_id)
      })
    )
  }

  const deletedDraft = await Draft.findByIdAndDelete(draftId)

  if(!deletedDraft){
    throw new ApiError(500,"Server Error While Deleting Draft.")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200,[],"Draft Deleted Successfully.")
    )
})

export {
   createDraft,
   getAllUserDrafts,
   getDraftById,
   deleteDraft
  };