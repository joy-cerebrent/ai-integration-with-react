import Conversation from "../models/Conversation.js";
import "../models/Message.js";

export const getConversationMessages = async (req, res) => {
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
      return res.status(403).json({ message: "Unauthorized: You are not the owner of this conversation" });
    }

    await conversation.populate("messages");

    return res.status(200).json({
      title: conversation.title,
      messages: conversation.messages || [],
    });
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
