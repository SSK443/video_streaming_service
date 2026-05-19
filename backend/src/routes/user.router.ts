import { Router } from "express";
import { registerUser } from "../controllers/user.controller.ts";
import {upload } from "../middlewares/multer.middleware.ts"

export const userRouter=Router()

// --- ARCHITECTURE CONNECTION: STEP 2 (user.router.ts) ---
// 1. The request arrives here from app.ts because the URL started with "/api/v1/users".
// 2. We match the exact route: "/register".
// 3. We run the `upload.fields` middleware first. Multer intercepts the files,
//    saves them locally, and attaches their details to `req.files`.
// 4. Finally, we pass the exact same request object (now carrying the files)
//    over to our `registerUser` controller.
userRouter.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1,
    },
    {
        name:"coverImage", 
        maxCount:1,
    }
]), registerUser)