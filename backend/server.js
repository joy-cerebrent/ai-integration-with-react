import express from 'express';
import cors from 'cors';
import path from "path";
import dotenv from 'dotenv';
import http from "http";

import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import messageRoutes from './routes/message.routes.js';
import notificationRoutes from './routes/notification.routes.js';

import connectToMongoDB from './db/connectToDb.js';

import { app, server } from './socket/socket.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

const corsOptions = {
  credentials: true,
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
  ],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notification', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

server.listen(PORT, async () => {
  try {
    await connectToMongoDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
});
