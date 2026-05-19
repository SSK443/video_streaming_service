import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
//import routes
import { userRouter } from "./routes/user.router.ts";


export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));

app.use(express.urlencoded({ extended: true, limit: "20kb" }));

app.use(express.static("public"));

app.use(cookieParser());


// --- ARCHITECTURE CONNECTION: STEP 1 (app.ts) ---
// This is the main entry point for requests.
// When a frontend request hits any URL starting with "/api/v1/users",
// this `app.use` intercepts it and passes the entire request over to `userRouter`.

// For example: http://localhost:3000/api/v1/users/register 
// -> Matches "/api/v1/users", so it goes to userRouter.
app.use("/api/v1/users", userRouter);