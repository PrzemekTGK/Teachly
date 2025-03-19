import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Video from "../models/videoModel.js";

const s3VideoBucket = "teachlyvideos";
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

export const uploadVideo = async (req, res) => {
  const { title, description, uploaderId, uploader } = req.body; // Access title and description from the request body
  const file = req.files[0]; // The uploaded file

  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  try {
    // Check if a video with the same title already exists
    const existingVideo = await Video.findOne({ title: title });

    if (existingVideo) {
      return res
        .status(400)
        .json({ message: "A video with this title already exists" });
    }
    // Create a new Video document in MongoDB
    const newVideo = new Video({
      title: title, // Save the title from the request body
      description: description, // Save the description from the request body
      uploaderId: uploaderId,
      uploader: uploader,
    });

    await newVideo.save();

    const bucketParams = {
      Bucket: s3VideoBucket,
      Key: newVideo._id.toString(), // You can still use the original filename or modify it for uniqueness
      Body: file.buffer,
    };

    const s3Response = await s3Client.send(new PutObjectCommand(bucketParams));

    res
      .status(200)
      .json({ success: true, video: newVideo, s3Data: s3Response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    // Fetch video metadata from MongoDB
    const videos = await Video.find();

    // Generate a pre-signed URL for each video
    const videosWithUrls = await Promise.all(
      videos.map(async (video) => {
        const command = new GetObjectCommand({
          Bucket: s3VideoBucket,
          Key: video._id.toString(),
        });
        const url = await getSignedUrl(s3Client, command); // URL expires in 1 hour
        return {
          ...video.toObject(),
          url,
        };
      })
    );

    res.status(200).json(videosWithUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
