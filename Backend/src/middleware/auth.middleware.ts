import type { Response, NextFunction, } from "express";
import { AuthRequest } from "../types/request.types";
import jwt from "jsonwebtoken";

// JWT PAYLOAD TYPE
interface JwtPayload {
    id: string;
}

// PROTECT ROUTES
export const protect = async ( req: AuthRequest, res: Response, next: NextFunction ) => {
    try {
        let token: string | undefined;

        // GET TOKEN FROM HEADER OR COOKIES
        if ( req.headers.authorization && req.headers.authorization.startsWith("Bearer") ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // NO TOKEN
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }

        // VERIFY TOKEN
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        // ATTACH USER ID
        req.user = decoded.id;

        next();
    } catch (error) {
        console.log(error);

        res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};