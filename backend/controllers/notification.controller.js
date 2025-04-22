import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getReceiverSocketId, io } from '../socket/socket.js';

export const getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('notifications');

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.notifications || []);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const addNotificationToUser = async (req, res) => {
  try {
    const { userId, type, content } = req.body;

    if (!userId || !type || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newNotification = new Notification({ userId, type, content });
    await newNotification.save();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications.push(newNotification._id);
    await user.save();

    const receiverSocketId = getReceiverSocketId(userId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", newNotification);

      console.log(`Notification sent to user ${userId}`);
    } else {
      console.log(`No socket found for user ${userId}`);
    }

    res.status(201).json({
      message: "Notification added successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.isRead) {
      return res.status(200).json({ message: "Notification already marked as read" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ message: "Server error" });
  }
};