import { ApiError } from "../utils/apiError.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { async_Handler } from "../utils/asyncHandler.ts";
import { clouinaryUpload } from "../utils/cloudinary.ts";
import type { Request, Response } from "express";
import { User } from "../models/user.models.ts";

export const registerUser = async_Handler(async (req: Request, res: Response) => {
    // --- ARCHITECTURE CONNECTION: STEP 3 (user.controller.ts) ---
    // The request successfully traveled from app.ts -> user.router.ts -> Multer -> here.
    // Because Multer already processed the request in the router, 
    // `req.body` contains the text fields and `req.files` contains the images.
    
    // get data from frontend
    const { userName, fullName, email, password } = req.body;

    console.log(`this req.body is : ${JSON.stringify(req.body)}, \n this req.files is: ${JSON.stringify(req.files)}`)
    console.log(`username: ${userName}, fullName: ${fullName}, email: ${email}, password: ${password}`);

    //check if fields are empty
    if ([userName, fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required");
    }

    //check if user already exists using email or username
    const existingUser = await User.findOne({
        $or: [{ email }, { userName }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    //check avatar and cover file then upload them on cloudinary

    // 1. Tell TypeScript exactly what type req.files is since we used upload.fields()
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const avatarLocalPath = files?.avatar?.[0]?.path;
    const coverImageLocalPath = files?.coverImage?.[0]?.path;




    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 2. Upload the local files to Cloudinary
    // We ALWAYS upload the avatar
    const avatarUpload = await clouinaryUpload(avatarLocalPath);

    console.log(`The avatar response :${avatarUpload}`);

    // We only call clouinaryUpload if coverImageLocalPath is not undefined
    const coverImageUpload = coverImageLocalPath ? await clouinaryUpload(coverImageLocalPath) : null;

    if (!avatarUpload) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    console.log(`the cover image response:${coverImageUpload}`);

    //create user object-create entry in db
    const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        email,
        password,
        // Use || "" to ensure it is always a string, not undefined!
        avatar: avatarUpload.url,
        coverImage: coverImageUpload?.url || "", 
    });
    
    //remove password and refresh token field from response 
  const userCreated=await User.findById(user._id)?.select(
    "-password -refreshToken"
  )

    //check for user creation
   if(!userCreated){
    throw new ApiError(500,"Something went wrong while registering the user")
   }

    //return response
  return res.status(201).json(
    new ApiResponse(200,userCreated,"User registered successfully")
  )
});
