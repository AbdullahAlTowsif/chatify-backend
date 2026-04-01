import http from "http";
import { Server } from "socket.io";
import { ENV } from "./env.js";
import express from "express";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ENV.CLIENT_URL,
        // methods: ["GET", "POST"],
        credentials: true,
    }
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this funciton to check if the user is online or not by checking if the userId exists in the userSocketMap
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {}; // {userId: socket.id}
io.on("connection", (socket) => {
    console.log("A user connected", socket.user.fullName);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export {io, app, server};