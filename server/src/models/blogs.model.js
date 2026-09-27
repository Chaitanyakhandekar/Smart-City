import mongoose from "mongoose";
import { Schema } from "mongoose";

const blogSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  content: {
    type: String,
    required:[true,"Content is required"]
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  images: [
    {
      url: String,
      public_id: String
    }
  ],
  totalLikes: {
    type: Number,
    default: 0
  },
  totalComments: {
    type: Number,
    default: 0
  },
  status:{
    type: String,
    enum:["draft","published","private"],
    default:"draft"
  },
  category:{
    type:String
  },
  tags:[
    String
  ],
  views:{
    type:Number,
    default:0
  },
  readTime:{
    type:String

  }
}, {timestamps: true});


export const Blog = mongoose.model("Blog", blogSchema);

