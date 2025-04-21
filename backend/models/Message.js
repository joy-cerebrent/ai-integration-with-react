import mongoose, { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: [
      true,
      "Messsage Must belong to a conversation",
    ],
  },
  sender: {
    type: String,
    enum: [
      "user",
      "ai"
    ],
    required: [
      true,
      "Sender must be specified",
    ],
  },
  content: {
    type: String,
    required: [
      true,
      "Content of the message is required",
    ],
  },
}, {
  timestamps: true,
});

const Message = mongoose.models?.Message || model("Message", MessageSchema);

export default Message;