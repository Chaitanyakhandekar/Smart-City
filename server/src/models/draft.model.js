import mongoose from "mongoose";
import { Schema } from "mongoose";

const draftSchema = new Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
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
  category:{
    type:String
  },
  tags:[
    String
  ],
 
}, {timestamps: true});


export const Draft = mongoose.model("Draft", draftSchema);

