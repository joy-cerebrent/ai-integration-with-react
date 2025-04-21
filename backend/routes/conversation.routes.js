import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { getUserConversations } from '../controllers/conversation.controller.js';

const router = express.Router();

router.get('/:userId', authenticateToken, getUserConversations);

export default router;
