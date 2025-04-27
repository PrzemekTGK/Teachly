// Import Mongoose for MongoDB schema creation
import mongoose from "mongoose";

// Define the stream schema for storing stream metadata
const streamSchema = mongoose.Schema({
  // ID of the streamer, required field
  streamerId: {
    type: String,
    required: true,
  },
  // Unique key for the stream, required field
  streamKey: {
    type: String,
    required: true,
  },
  // URL of the stream, required field
  streamUrl: {
    type: String,
    required: true,
  },
  // Title of the stream, required field
  streamtitle: {
    type: String,
    required: true,
  },
  // Description of the stream, required field
  streamdescription: {
    type: String,
    required: true,
  },
  // Indicates if the stream is currently live, required field
  isLive: {
    type: Boolean,
    required: true, // Fixed typo: 'require' to 'required'
  },
  // URL of the stream's thumbnail, required field with default empty string
  thumbnailUrl: {
    type: String,
    default: "",
    required: true,
  },
});

// Create the Stream model from the schema
const Stream = mongoose.model("Stream", streamSchema);

// Export the Stream model for use in other parts of the application
export default Stream;
