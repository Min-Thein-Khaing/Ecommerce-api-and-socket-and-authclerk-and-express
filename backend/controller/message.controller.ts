import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverId, io } from "../config/socket.js";

interface CustomRequest extends Request {
  user?: any;
  userId?: number | string | null;
}

export const getCurrentUser = async (req: CustomRequest, res: Response) => {
  const { _id, name, email, image, role } = req.user;
  return res.status(200).json({ _id, name, email, image, role });
};

export const getUsersForSidebar = async (req: CustomRequest, res: Response) => {
  const userId = req.user._id;

  const user = await User.find({ _id: { $ne: userId } }).select("-clerkId");

  return res.status(200).json(user);
};

export const getConversationsForSidebar = async (
  req: CustomRequest,
  res: Response,
) => {
  const userId = req.user._id;
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ["$senderId", userId] },
            then: "$receiverId",
            else: "$senderId",
          },
        },
        lastMessageAt: { $max: "$createdAt" },
      },
    },
    {
      $sort: {
        lastMessageAt: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        "user.clerkId": 0,
      },
    },
  ]);

  return res.status(200).json(conversations);
};

export const getMessages = async (req: CustomRequest, res: Response) => {
  const userId = req.user._id;
  const { receiverId } = req.params;

  const message = await Message.find({
    $or: [
      { senderId: userId, receiverId },
      { senderId: receiverId, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });

  return res.status(200).json(message);
};

export const sendMessage = async (req: CustomRequest, res: Response) => {
  const userId = req.user._id;
  const receiverId = req.params.receiverId as string;
  const { text, image, video } = req.body;
  const newMessage = await Message.create({
    senderId: userId,
    receiverId,
    text,
    image,
    video,
  });
  const receiverSocketId = getReceiverId(receiverId);
  // only send the message in realtime if user is online
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }
  return res.status(201).json(newMessage);
};
