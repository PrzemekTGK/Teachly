// Import Express framework for creating the router
import express from "express";

// Import middleware for token verification
import { verifyToken } from "../controllers/verificationController.js";

// Import controller functions for image-related operations
import {
  uploadImage, // Handles uploading an image to AWS
  deleteImage, // Deletes an image by ID
  getImage, // Retrieves an image by ID
} from "../controllers/awsImgController.js";

// Initialize an Express router instance
const awsImgRouter = express.Router();

// Route to upload an image to AWS (protected, requires valid token)
awsImgRouter.post("/upload", verifyToken, uploadImage);

// Route to get an image by ID (protected, requires valid token)
awsImgRouter.get("/:id", verifyToken, getImage);

// Route to delete an image by ID (protected, requires valid token)
awsImgRouter.delete("/delete/:id", verifyToken, deleteImage);

// Export the router for use in the main application
export default awsImgRouter;
