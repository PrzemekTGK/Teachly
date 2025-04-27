// Import Express framework for creating the router
import express from "express";

// Import controller functions for stream-related operations
import {
  getStreams, // Retrieves a list of available streams
  getStream, // Retrieves a specific stream by streamKey
  streamProxy, // Proxies HLS (HTTP Live Streaming) requests
  publishStream, // Handles publishing a new stream
  deleteStream, // Deletes a stream
  validateStreamKey, // Validates a stream key
} from "../controllers/streamController.js";

// Initialize an Express router instance
const streamRouter = express.Router();

// Route to get a list of all streams
streamRouter.get("/get-streams", getStreams);

// Route to get a specific stream by its streamKey
streamRouter.get("/get-stream/:streamKey", getStream);

// Route to proxy HLS streaming requests (used for serving video streams)
streamRouter.use("/hls", streamProxy);

// Route to publish a new stream
streamRouter.post("/publish-stream", publishStream);

// Route to delete a stream
streamRouter.delete("/delete-stream", deleteStream);

// Route to validate a stream key, accepts any HTTP method (GET, POST, etc.)
streamRouter.all("/validate-stream-key", validateStreamKey);

// Export the router for use in the main application
export default streamRouter;
