import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiUtils.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import dotenv from "dotenv"

dotenv.config({path:"./.env"})

const userAuth = asyncHandler(async (req,res,next)=>{
    const {accessToken} = req.cookies;
    // console.log("Access Token From Cookies : ",req.cookies)

    if(!accessToken || accessToken.trim()===""){
       if(req.headers["x-auth-check-type"] && req.headers["x-auth-check-type"] === "login-check-hit"){
        return res
                .status(200)
                .json(
                    {
                        success: false,
                        isLoggedIn : false
                    }
                )
       }
        throw new ApiError(401,"Unauthorize User");
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)

    } catch (error) {
        throw new ApiError(500,"Error While Decoding AccessToken")
    }

    if(!decodedToken){
        throw new ApiError(500,"No Decoded Token Found")
    }

    const user = await User.findById(decodedToken.id).select("-password")

    req.user = user

    next();
})

export {userAuth}