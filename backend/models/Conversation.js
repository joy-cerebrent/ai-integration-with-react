import mongoose, { Schema, model } from "mongoose";

const ConversationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [
      true,
      "Conversation must belong to a user",
    ],
  },
  title: {
    type: String,
    required: [
      true,
      "Conversation must have a title",
    ],
  },
  messages: [{
    type: Schema.Types.ObjectId,
    ref: "Message",
  }],
}, {
  timestamps: true,
});

const Conversation = mongoose.models?.Conversation || model("Conversation", ConversationSchema);

export default Conversation;