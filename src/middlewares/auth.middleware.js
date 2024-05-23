import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
        //console.log(token);
        const decodedToken=jwt.verify(token,
            process.env.ACCESS_TOKEN_SECRET)
        //console.log(decodedToken);
        const user=await User.findById(decodedToken?._id)
        .select("-password")

        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user=user;
        next()
    } catch (error){
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new ApiError(403,"You are not authorized to do this."); // Forbidden
      }
      next();
    };
  };