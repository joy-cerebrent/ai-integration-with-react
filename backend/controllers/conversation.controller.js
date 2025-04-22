import User from "../models/User.js";
import "../models/Conversation.js";
import Conversation from "../models/Conversation.js";

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log(req.user.id)

    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Access Denied' });
    }

    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(userId).populate({
      path: 'conversations',
      options: {
        strictPopulate: false,
        sort: { updatedAt: -1 },
      },
      select: '_id title',
    });

    return res.status(200).json({ conversations: user?.conversations || [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    console.log(userId)

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newConversation = await Conversation.create({
      userId,
      title: title.trim(),
      messages: [],
    });

    user.conversations.push(newConversation._id);
    await user.save();

    return res.status(200).json({ id: newConversation._id });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You are not the owner of this conversation" });
    }

    await Conversation.findByIdAndDelete(conversationId);

    const user = await User.findById(userId);
    user.conversations = user.conversations.filter(convoId => convoId.toString() !== conversationId);
    await user.save();

    return res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ message: "Server error" });
  }
}