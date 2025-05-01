import express from 'express';
import {
  addNotificationToUser,
  deleteNotification,
  getNotificationsForUser,
  setNotificationRead
} from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.get("/", authenticateToken, getNotificationsForUser);
router.post("/add", addNotificationToUser);
router.post("/setRead/:notificationId", setNotificationRead);
router.delete("/delete/:notificationId", deleteNotification);

export default router;
