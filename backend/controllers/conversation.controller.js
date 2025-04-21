import User from "../models/User.js";
import "../models/Conversation.js";

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

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
