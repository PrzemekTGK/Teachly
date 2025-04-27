// Import WebSocket for client communication
import { WebSocket } from "ws";
// Import AWS S3 client and command for deleting objects
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
// Import AWS credential provider
import { fromEnv } from "@aws-sdk/credential-providers";
// Import Stream and User models
import Stream from "../models/streamModel.js";
import User from "../models/userModel.js";
// Import HTTP module for proxy requests
import http from "http";
// Import Axios for making HTTP requests
import axios from "axios";

// Define S3 bucket name for stream thumbnails
const s3StreamThumbnailBucket = "teachlystreamthumbnails";
// Initialize S3 client with region and environment credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

// Validate a stream key and notify WebSocket client
export const validateStreamKey = async (req, res) => {
  // Extract streamKey from request body
  const streamKey = req.body.name;

  try {
    // Find user with the provided streamKey
    const user = await User.findOne({ streamKey });

    // Return error if user not found
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Return error if user is not a creator
    if (user.role !== "creator") {
      return res
        .status(400)
        .json({ success: false, message: "User is not a content creator" });
    }

    // Return error if streamKey does not match
    if (user.streamKey !== streamKey) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid stream key" });
    }

    // Notify WebSocket client of stream start after 10 seconds
    setTimeout(() => {
      const clients = req.app.get("wssClients");
      const client = clients.get(streamKey);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ streamKey, action: "streamStarted" }));
      }
    }, 10000);

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Stream key is valid!" });
  } catch (error) {
    // Log and return server error
    console.error("Detailed error in validateStreamKey:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Proxy HLS streaming requests to an external server
export const streamProxy = (req, res) => {
  // Construct target URL for the proxy request
  const targetUrl = `http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls${req.url}`;

  // Define proxy request options
  const options = {
    hostname: "ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
    path: `/hls${req.url}`,
    method: req.method,
    headers: {
      ...req.headers,
      "Cache-Control": "no-cache", // Prevent caching
      "If-Modified-Since": "", // Clear caching headers
      "If-None-Match": "", // Prevent 304 responses
    },
    timeout: 10000, // Set request timeout
  };

  // Create and send proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Forward response headers and status to client
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      "Cache-Control": "no-cache", // Ensure no client caching
    });
    // Pipe response data to client
    proxyRes.pipe(res);
  });

  // Handle proxy request errors
  proxyReq.on("error", (err) => {
    res.status(502).send("Proxy failed: " + err.message);
  });

  // Handle proxy request timeout
  proxyReq.on("timeout", () => {
    res.status(504).send("Proxy request timed out");
    proxyReq.destroy();
  });

  // Pipe incoming request data to proxy request
  req.pipe(proxyReq);
};

// Publish a new stream and generate a thumbnail
export const publishStream = async (req, res) => {
  // Extract stream data from request body
  const stream = req.body;

  // Validate required fields
  if (
    !stream.streamtitle ||
    !stream.streamdescription ||
    !stream.streamerId ||
    !stream.streamUrl
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  try {
    // Extract streamKey from streamUrl
    const streamKey = stream.streamUrl.split("/").pop().replace(".m3u8", "");
    let thumbnailUrl = "";

    // Attempt to generate thumbnail
    try {
      const thumbnailResponse = await axios.post(
        "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com:3001/generate-thumbnail",
        { streamUrl: stream.streamUrl, streamKey },
        { timeout: 10000 }
      );
      if (thumbnailResponse.data.success) {
        thumbnailUrl = thumbnailResponse.data.thumbnailUrl;
      }
    } catch (error) {
      // Log and return error if thumbnail generation fails
      console.error("Error publishing stream:", error);
      return res
        .status(500)
        .json({ message: "Failed to publish stream", error: error.message });
    }

    // Create and save new stream document
    const newStream = new Stream({
      streamtitle: stream.streamtitle,
      streamdescription: stream.streamdescription,
      streamerId: stream.streamerId,
      streamKey: streamKey,
      streamUrl: stream.streamUrl,
      thumbnailUrl: thumbnailUrl,
      isLive: true,
    });
    await newStream.save();

    // Return success response
    res
      .status(201)
      .json({ success: true, message: "Published stream successfully!" });
  } catch (error) {
    // Log and return server error
    console.error("Error publishing stream:", error);
    res
      .status(500)
      .json({ success: false, message: "Error publishing stream!" });
  }
};

// Retrieve all live streams
export const getStreams = async (req, res) => {
  try {
    // Find all streams with isLive set to true
    const streams = await Stream.find({ isLive: true });
    // Return streams data
    res.status(200).json({ success: true, data: streams });
  } catch (error) {
    // Return server error
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Retrieve a specific stream by streamKey or ID
export const getStream = async (req, res) => {
  try {
    // Extract streamKey from request parameters
    const { streamKey } = req.params;
    // Validate streamKey presence
    if (!streamKey) {
      return res
        .status(400)
        .json({ success: false, message: "Stream key or ID required" });
    }
    // Attempt to find stream by streamKey
    let stream = await Stream.findOne({ streamKey });
    // Fallback to find by ID if streamKey search fails
    if (!stream) {
      stream = await Stream.findById(streamKey);
    }
    // Return error if stream not found
    if (!stream) {
      return res
        .status(404)
        .json({ success: false, message: "Stream not found" });
    }
    // Return stream data
    res.status(200).json({ success: true, data: stream });
  } catch (error) {
    // Log and return server error
    console.error("Error getting stream:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a stream and its associated thumbnail
export const deleteStream = async (req, res) => {
  // Extract streamKey from request body
  const streamKey = req.body.name;
  // Validate streamKey presence
  if (!streamKey) {
    return res
      .status(400)
      .json({ success: false, message: "Stream key required" });
  }
  try {
    // Find stream by streamKey
    const stream = await Stream.findOne({ streamKey });
    // Delete thumbnail from S3 if it exists
    if (stream && stream.thumbnailUrl) {
      const key = stream.thumbnailUrl.split("/").pop();
      try {
        // Send S3 delete command
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: s3StreamThumbnailBucket,
            Key: key,
          })
        );
      } catch (s3Error) {
        // Log S3 deletion error but continue
        console.error("S3 deletion error:", s3Error.message);
      }
    }
    // Delete stream document
    const result = await Stream.deleteOne({ streamKey });

    // Notify WebSocket client of stream stop after 5 seconds
    setTimeout(() => {
      const clients = req.app.get("wssClients");
      const client = clients.get(streamKey);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ streamKey, action: "streamStopped" }));
      }
    }, 5000);

    // Return success or not found response based on deletion result
    res.status(result.deletedCount ? 200 : 404).json({
      success: !!result.deletedCount,
      message: result.deletedCount ? "Deleted" : "Not found",
    });
  } catch (error) {
    // Log and return server error
    console.error("Error in deleteStream:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
