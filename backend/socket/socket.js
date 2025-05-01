// socket.js
import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

export const app = express();
export const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map();

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

const handleSocketConnection = (socket) => {
  console.log("A User Connected : ", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected: ", socket.id);
    
    // if (userId) {
    //   userSocketMap.delete(userId);
    //   console.log(`User ${userId} removed from map`);
    // }
  });
};

io.on("connection", handleSocketConnection);
