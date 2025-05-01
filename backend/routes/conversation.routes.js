import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import {
  createConversation,
  deleteConversation,
  getUserConversations,
  renameConversation
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.get('/:userId', authenticateToken, getUserConversations);
router.post('/create', authenticateToken, createConversation);
router.patch('/rename/:conversationId', authenticateToken, renameConversation);
router.delete('/:conversationId', authenticateToken, deleteConversation);

export default router;
