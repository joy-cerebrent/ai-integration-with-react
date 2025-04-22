import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { getConversationMessages } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/:conversationId', authenticateToken, getConversationMessages);

export default router;
