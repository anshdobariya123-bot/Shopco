import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI not defined in environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true, // dev-friendly (disable in huge prod DBs)
      serverSelectionTimeoutMS: 5000, // fail fast
      socketTimeoutMS: 45000,
      family: 4, // IPv4
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    /* CONNECTION EVENTS */
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
