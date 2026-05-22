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

/**
 * Middleware: verifyJWT
 * - Protects routes by ensuring a valid JWT access token is present.
 * - Token sources checked (in order): cookie `accessToken`, `Authorization` header (`Bearer <token>`).
 * - Verifies token signature and expiration using `process.env.SECRET_ACCESS_TOKEN`.
 * - Loads user from DB (excluding sensitive fields) and attaches it to `req.user`.
 * - Throws `ApiError` with appropriate status/message on failure.
 */
export const verifyJWT = async_Handler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Extract token from cookie or Authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // No token provided -> 401 Unauthorized
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    // 2) Verify token signature and decode payload
    // jwt.verify will throw on invalid signature or expired token.
    const decodedToken: { _id?: string; iat?: number; exp?: number } = jwt.verify(
      token,
      process.env.SECRET_ACCESS_TOKEN as string
    ) as any;

    // 3) Fetch user from DB using id from token payload
    // Exclude sensitive fields like password and refreshToken
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      // Token contained a user id that doesn't exist anymore
      throw new ApiError(401, "Unauthorized: Invalid token");
    }

    // 4) Attach user to request for downstream handlers/controllers
    req.user = user;
    next();
  } catch (error: any) {
    // If the error was thrown by jsonwebtoken (invalid/expired token)
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, error?.message || "Unauthorized: Invalid access token");
    } else {
      // Other errors (e.g., DB issues)
      throw new ApiError(500, "Something went wrong while verifying token");
    }
  }
});