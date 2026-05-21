import { ApiError } from "../utils/apiError.ts";
import { async_Handler } from "../utils/asyncHandler.ts";
import type { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.ts";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyJWT=async_Handler(async(req:Request,res:Response,next:NextFunction){
try {
        // --- ARCHITECTURE CONNECTION: STEP 4 (auth.middleware.ts) ---
        // This middleware is used in the user.router.ts to protect certain routes. 
        // When a request hits those routes, it first goes through this middleware before reaching the controller.
        // The middleware checks for the presence and validity of the JWT token in the request headers.
        // If the token is valid, it allows the request to proceed to the controller; otherwise, it returns an error response.
    
    
        const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unauthorized: No token provided")
        };
    
       const decodedToken: any =await jwt.verify(token, process.env.SECRET_ACCESS_TOKEN as string);
    
       const user= await User.findById(decodedToken?._id).select("-password -refreshToken");
    
       if(!user){
        throw new ApiError(401,"Unauthorized: Invalid token")
       }
       req.user=user;
       next();
} catch (error) {
   if(error instanceof jwt.JsonWebTokenError){
    throw new ApiError(401,error?.message||"Unauthorized: Invalid access token")
   }else{
    throw new ApiError(500,"Something went wrong while verifying token")
   }
}

})