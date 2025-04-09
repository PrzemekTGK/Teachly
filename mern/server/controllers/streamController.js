import { WebSocket } from "ws";
import User from "../models/userModel.js";
import http from "http";
export const validateStreamKey = async (req, res) => {
  console.log("VALIDATING STREAM KEY!");
  const streamKey = req.body.name;

  try {
    // Find the user by ID and check if they are a 'creator'
    const user = await User.findOne({ streamKey });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user is a creator and the stream key matches
    if (user.role !== "creator") {
      return res
        .status(400)
        .json({ success: false, message: "User is not a content creator" });
    }

    // Compare the provided streamKey with the one in the database
    if (user.streamKey !== streamKey) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid stream key" });
    }

    // Stream key is valid—notify frontend via WebSocket
    const clients = req.app.get("wssClients");
    console.log(`Clients available: ${clients.size}`);
    const client = clients.get(streamKey);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ streamKey, action: "streamStarted" }));
      console.log(`Sent streamStarted to ${streamKey}`);
    } else {
      console.log(`No client found or not open for ${streamKey}`);
    }

    // If everything is valid, return a success message
    return res
      .status(200)
      .json({ success: true, message: "Stream key is valid!" });
  } catch (error) {
    console.error("Detailed error in validateStreamKey:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const streamProxy = (req, res) => {
  const targetUrl = `http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls${req.url}`;

  const options = {
    hostname: "ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
    path: `/hls${req.url}`,
    method: req.method,
    headers: {
      ...req.headers,
      "Cache-Control": "no-cache", // Force fresh response
      "If-Modified-Since": "", // Clear caching headers
      "If-None-Match": "", // Prevent 304
    },
    timeout: 10000,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      "Cache-Control": "no-cache", // Ensure client doesn’t cache
    });
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    res.status(502).send("Proxy failed: " + err.message);
  });

  proxyReq.on("timeout", () => {
    res.status(504).send("Proxy request timed out");
    proxyReq.destroy();
  });

  req.pipe(proxyReq);
};
