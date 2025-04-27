// Import Mongoose for MongoDB connection
import mongoose from "mongoose";

// Export function to connect to MongoDB
export const connectDB = async () => {
  try {
    // Connect to MongoDB using the ATLAS_URI environment variable
    const conn = await mongoose.connect(process.env.ATLAS_URI);
    // Log successful connection with host details
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // Log error message if connection fails
    console.error(`Error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};
