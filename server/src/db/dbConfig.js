import mongoose from "mongoose";
import mongodb from "mongodb";
import dotenv from "dotenv"

dotenv.config({path:"./.env"})

const connectDB = async () => {
  try {
    console.log("MongoDB connecting...");
    const connectionInfo = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected successfully: ${connectionInfo.connection.host}`);
    console.log(`Database: ${connectionInfo.connection.name}`);
    return connectionInfo;
  } catch (error) {
    console.error("MongoDB connection error: ", error.message);
    throw error;
  }
};

export default connectDB;