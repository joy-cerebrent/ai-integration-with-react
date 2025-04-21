import mongoose from "mongoose";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (mongoose.connection.readyState === 1) {
      console.log("Connected to MongoDB ✅");
      return true;
    } else {
      throw new Error("MongoDB not connected properly.");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectToMongoDB;
