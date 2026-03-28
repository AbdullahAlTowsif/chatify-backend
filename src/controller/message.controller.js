import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);

    } catch (error) {
        console.log("Error in getAllContacts", error);
        res.status(500).json({ message: error.message });
    }
};

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        // me and you are messaging each other
        // either I am sender and you are receiver or I am receiver and you are sender
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });
        res.status(200).json({ messages: messages });
    } catch (error) {
        console.log("Error in getMessagesByUserId", error);
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const { id: receiverId } = req.params;

        if(!text && !image) {
            return res.status(400).json({ message: "Message text or image is required" });
        }
        if(senderId.toString() === receiverId.toString()) {
            return res.status(400).json({ message: "You cannot send message to yourself" });
        }
        const receiverExists = await User.exists({ _id: receiverId });
        if(!receiverExists) {
            return res.status(404).json({ message: "Receiver user not found" });
        }

        let imageUrl;

        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            text,
            image: imageUrl,
            senderId,
            receiverId
        });

        await newMessage.save();
        // TODO: send message in real-time using socket.io
        res.status(201).json({ message: "Message sent successfully", newMessage });

    } catch (error) {
        console.log("Error in sendMessage", error);
        res.status(500).json({ message: error.message });
    }
};


export const getAllPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // find all the messages where the logged-in user is either sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId },
            ],
        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

        res.status(200).json(chatPartners);
    } catch (error) {
        console.log("Error in getAllPartners", error);
        res.status(500).json({ message: error.message });
    }
};
