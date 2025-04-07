import { WebSocket } from "ws";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const checkPassword = async (req, res) => {
  const { userId, currentPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Compare hashed password
    const isMatch = await bcryptjs.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Password is correct" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // ✅ Compare hashed password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ success: true, data: token });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyToken = async (req, res, next) => {
  console.log(`🔍 Checking token for: ${req.path}`); // Debugging log

  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) {
    console.log(`🚨 No token provided for: ${req.path}`);
    return res
      .status(401)
      .json({ message: "Authantication token is missing!" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (error, user) => {
    try {
      req.body.user = user;
      next();
    } catch (error) {
      return res
        .status(403)
        .json({ message: `Authantication token is invalid! ${error.message}` });
    }
  });
};
