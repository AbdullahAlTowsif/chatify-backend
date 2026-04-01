import { ENV } from "../lib/env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        // extract token from http-only cookie
        const token = socket.handshake.headers.cookie?.split(';').find((row) => row.startsWith('token='))?.split('=')[1];

        if (!token) {
            console.log("Socket connection rejected: No token provided!");
            return next(new Error("Authentication error: No token provided!"));
        }

        // verify the token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            console.log("Socket connection rejected: Invalid token");
            return next(new Error("Authentication error: Invalid token!"));
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            console.log("Socket connection rejected: User not found");
            return next(new Error("Authentication error: User not found!"));
        }

        // attach user info to socket object for later use
        socket.user = user;
        socket.userId = user._id.toString();

        console.log(`Socket connection authenticated for user: ${user.fullName} (${user._id})`);
        next();
    } catch (error) {
        console.error("Socket authentication error:", error);
        res.status(500).json({message: "Server error during socket authentication!"});
    }
}
