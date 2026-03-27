import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const {fullName, email, password} = req.body;

  try {
    if(!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if(password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if emails valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if(user) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ fullName, email, password: hashedPassword });
    
    if(newUser) {
        await newUser.save();
        generateToken(newUser._id, res)
        res.status(201).json({
            message: "User created successfully",
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        });

        try {
            await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL)
        } catch (error) {
            console.log("Failed to send Welcome Email");
        }
    }
    else {
        res.status(400).json({ message: "Invalid user data" });
    }

  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        generateToken(user._id, res);
        res.status(200).json({
            message: "Login successful",
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = (_, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error in logout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
