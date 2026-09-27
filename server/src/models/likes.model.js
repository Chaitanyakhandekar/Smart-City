import mongoose from "mongoose";
import { Schema } from "mongoose";

const likeSchema = new Schema({
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
  },
  comment:{
    type:Schema.Types.ObjectId,
    ref:"Comment"
  },
  likedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true,"LikedBy is Required Field."]
  },
  isLiked:{
    type:Boolean,
    default:true
  }
}, {timestamps: true});
export const Like = mongoose.model("Like", likeSchema);