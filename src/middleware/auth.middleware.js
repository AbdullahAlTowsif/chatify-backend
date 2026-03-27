import { ENV } from "../lib/env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access" });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }
        req.user = user;
        next();

    } catch (error) {
        console.error("Error in protectRoute:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
