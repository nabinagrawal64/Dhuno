import { Request } from "express";
import { Types } from "mongoose";

// Marks handlers that require an authenticated user.
// `user` is set by the protect middleware after JWT verification.
export interface AuthRequest extends Request {
    user?: Types.ObjectId | string;
}