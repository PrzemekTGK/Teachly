// Import Mongoose for MongoDB schema creation
import mongoose from "mongoose";

// Define the video schema for storing video metadata
const videoSchema = mongoose.Schema({
  // Video title, required field
  title: {
    type: String,
    required: true,
  },
  // Video description, optional field
  description: {
    type: String,
    required: false,
  },
  // Uploader's name or identifier, references the User model, required field
  uploader: {
    type: String,
    ref: "User", // Reference to the User model
    required: true,
  },
  // Uploader's unique ID, references the User model, required field
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  // Timestamp of when the video was uploaded, defaults to current date/time
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Video model from the schema
const Video = mongoose.model("Video", videoSchema);

// Export the Video model for use in other parts of the application
export default Video;
