// Import required dependencies
import express from "express"; // Express framework for building the server
import cors from "cors"; // Middleware to handle Cross-Origin Resource Sharing
import dotenv from "dotenv"; // Loads environment variables from .env file
import userRouter from "./routes/userRouter.js"; // Router for user-related API endpoints
import awsImgRouter from "./routes/awsImgRouter.js"; // Router for AWS image-related API endpoints
import awsVidRouter from "./routes/awsVidRouter.js"; // Router for AWS video-related API endpoints
import streamRouter from "./routes/streamRouter.js"; // Router for streaming-related API endpoints
import { connectDB } from "./config/db.js"; // Function to connect to the database
import { createServer } from "http"; // HTTP server module for WebSocket integration
import { initializeWebSocket } from "./websocket.js"; // Function to initialize WebSocket
import multer from "multer"; // Middleware for handling multipart/form-data (file uploads)

// Load environment variables from .env file
dotenv.config();

// Define the server port, defaulting to 5000 if not specified in environment variables
const PORT = process.env.PORT || 5000;

// Initialize Express application
const app = express();

// Configure Multer for handling file uploads (no specific storage defined, likely for in-memory processing)
const upload = multer();

// Create an HTTP server instance using the Express app
const server = createServer(app);

// Initialize WebSocket and store connected clients
const clients = initializeWebSocket(server);
// Attach WebSocket clients to the Express app for use in other parts of the application
app.set("wssClients", clients);

// Configure CORS middleware to allow requests from a specific origin
app.use(
  cors({
    origin: "https://teachly.up.railway.app", // Allow requests only from this origin
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"], // Allowed headers
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
  })
);

// Enable Multer middleware to handle multipart/form-data requests (file uploads)
app.use(upload.any());

// Enable parsing of JSON request bodies
app.use(express.json());
// Enable parsing of URL-encoded request bodies (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// Define API routes for different resources
app.use("/api/images", awsImgRouter); // Routes for handling image-related requests
app.use("/api/videos", awsVidRouter); // Routes for handling video-related requests
app.use("/api/users", userRouter); // Routes for handling user-related requests
app.use("/api/stream", streamRouter); // Routes for handling streaming-related requests

// Start the HTTP server and connect to the database
server.listen(PORT, "0.0.0.0", () => {
  connectDB(); // Establish database connection
  console.log(`Server started on port `, PORT); // Log server startup
});
