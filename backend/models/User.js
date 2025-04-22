import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: [
      true,
      "Email is required",
    ],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Email is invalid",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [
      true,
      "Name is required",
    ],
  },
  conversations: [{
    type: Schema.Types.ObjectId,
    ref: "Conversation",
  }],
  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
}, {
  timestamps: true,
});

const User = mongoose.models?.User || model("User", UserSchema);

export default User;