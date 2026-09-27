import mongoose,{Schema} from "mongoose";

const followSchema = new Schema({
    followTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Followed user id is required"]
    },
    followedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Follower user id is required"]
    }
})

export const Follow = mongoose.model("Follow",followSchema);