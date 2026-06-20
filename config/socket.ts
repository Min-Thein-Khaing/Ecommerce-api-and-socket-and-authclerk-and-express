import "dotenv/config";

import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
const io = new Server(server,{
    cors: {
        origin: [origin],
        credentials: true
}});


function getReceiverId(userId :string) {
  return userSocketMap[userId]
}

const userSocketMap: Record<string, string> = {};


io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;

  if(userId){
    userSocketMap[userId] = socket.id
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if(userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
})

export {io,server,userSocketMap,getReceiverId}