import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { getConversationMessages, saveMessageToDb } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/:conversationId', authenticateToken, getConversationMessages);
router.post('/save', authenticateToken, saveMessageToDb);

export default router;
