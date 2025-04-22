import mongoose, { Schema, model } from "mongoose";

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [
      true,
      "Notification must belong to a User"
    ],
  },
  type: {
    type: String,
    enum: ["finished", "pending", "failed"],
    required: [
      true,
      "Type must be specified",
    ],
  },
  content: {
    type: String,
    required: [
      true,
      "Content of the message is required",
    ],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.models?.Notification || model("Notification", NotificationSchema);

export default Notification;
