import { WebSocket } from "ws";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import Stream from "../models/streamModel.js";
import User from "../models/userModel.js";
import http from "http";
import axios from "axios";

const s3StreamThumbnailBucket = "teachlystreamthumbnails";
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

export const validateStreamKey = async (req, res) => {
  const streamKey = req.body.name;

  try {
    const user = await User.findOne({ streamKey });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "creator") {
      return res
        .status(400)
        .json({ success: false, message: "User is not a content creator" });
    }

    if (user.streamKey !== streamKey) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid stream key" });
    }

    setTimeout(() => {
      const clients = req.app.get("wssClients");
      const client = clients.get(streamKey);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ streamKey, action: "streamStarted" }));
      }
    }, 10000);

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

export const publishStream = async (req, res) => {
  const stream = req.body;

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
    const streamKey = stream.streamUrl.split("/").pop().replace(".m3u8", "");
    let thumbnailUrl = "";

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
      console.error("Error publishing stream:", error);
      res
        .status(500)
        .json({ message: "Failed to publish stream", error: error.message });
    }

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

    res
      .status(201)
      .json({ success: true, message: "Published stream successfully!" });
  } catch (error) {
    console.error("Error publishing stream:", error);
    res
      .status(500)
      .json({ success: false, message: "Error publishing stream!" });
  }
};

export const getStreams = async (req, res) => {
  try {
    const streams = await Stream.find({ isLive: true });
    res.status(200).json({ success: true, data: streams });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

export const getStream = async (req, res) => {
  try {
    const { streamKey } = req.params;
    if (!streamKey) {
      return res
        .status(400)
        .json({ success: false, message: "Stream key or ID required" });
    }
    let stream = await Stream.findOne({ streamKey });
    if (!stream) {
      stream = await Stream.findById(streamKey);
    }
    if (!stream) {
      return res
        .status(404)
        .json({ success: false, message: "Stream not found" });
    }
    res.status(200).json({ success: true, data: stream });
  } catch (error) {
    console.error("Error getting stream:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteStream = async (req, res) => {
  const streamKey = req.body.name;
  if (!streamKey) {
    return res
      .status(400)
      .json({ success: false, message: "Stream key required" });
  }
  try {
    const stream = await Stream.findOne({ streamKey });
    if (stream && stream.thumbnailUrl) {
      const key = stream.thumbnailUrl.split("/").pop();
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: s3StreamThumbnailBucket,
            Key: key,
          })
        );
      } catch (s3Error) {
        console.error("S3 deletion error:", s3Error.message);
      }
    }
    const result = await Stream.deleteOne({ streamKey });

    setTimeout(() => {
      const clients = req.app.get("wssClients");
      const client = clients.get(streamKey);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ streamKey, action: "streamStopped" }));
      }
    }, 5000);

    res.status(result.deletedCount ? 200 : 404).json({
      success: !!result.deletedCount,
      message: result.deletedCount ? "Deleted" : "Not found",
    });
  } catch (error) {
    console.error("Error in deleteStream:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
