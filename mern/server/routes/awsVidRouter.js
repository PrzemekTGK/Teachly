// Import Express framework for creating the router
import express from "express";

// Import middleware for token verification
import { verifyToken } from "../controllers/verificationController.js";

// Import controller functions for video-related operations
import {
  uploadVideo, // Handles uploading a video to AWS
  getVideos, // Retrieves a list of videos
  deleteVideo, // Deletes a single video by ID
  deleteVideos, // Deletes multiple videos
} from "../controllers/awsVidController.js";

// Initialize an Express router instance
const awsVidRouter = express.Router();

// Route to get a list of videos (public, no authentication required)
awsVidRouter.get("/", getVideos);

// Route to upload a video to AWS (protected, requires valid token)
awsVidRouter.post("/upload", verifyToken, uploadVideo);

// Route to delete a single video by ID (protected, requires valid token)
awsVidRouter.delete("/:id", verifyToken, deleteVideo);

// Route to delete multiple videos (protected, requires valid token)
awsVidRouter.post("/delete", verifyToken, deleteVideos);

// Export the router for use in the main application
export default awsVidRouter;
