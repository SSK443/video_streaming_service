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


//http://localhost:3000/api/v1/users/register -the router should be like this
app.use("/api/v1/users", userRouter);