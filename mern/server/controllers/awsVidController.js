import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
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
  const { title, description, uploaderId, uploader } = req.body;
  const file = req.files[0];

  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  try {
    const existingVideo = await Video.findOne({ title: title });

    if (existingVideo) {
      return res
        .status(400)
        .json({ message: "A video with this title already exists" });
    }

    const newVideo = new Video({
      title: title,
      description: description,
      uploaderId: uploaderId,
      uploader: uploader,
      ContentType: "video/mp4",
    });

    await newVideo.save();

    const bucketParams = {
      Bucket: s3VideoBucket,
      Key: newVideo._id.toString(),
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
    const { uploaderId } = req.query;

    // Filter by uploaderId if provided, else fetch all videos
    const filter = uploaderId ? { uploaderId } : {};

    const videos = await Video.find(filter);

    const videosWithUrls = await Promise.all(
      videos.map(async (video) => {
        const command = new GetObjectCommand({
          Bucket: s3VideoBucket,
          Key: video._id.toString(),
        });
        const url = await getSignedUrl(s3Client, command);
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

export const deleteVideo = async (req, res) => {
  const videoId = req.params.id;
  if (!videoId) {
    return res.status(400).json({ error: "Video ID is required." });
  }

  try {
    const bucketParams = {
      Bucket: s3VideoBucket,
      Key: videoId.toString(),
    };

    await s3Client.send(new DeleteObjectCommand(bucketParams));

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
      return res.status(404).json({ error: "Video not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVideos = async (req, res) => {
  const { videoIds } = req.body; // Expecting an array of video IDs

  if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
    return res.status(400).json({ error: "Video IDs are required." });
  }

  try {
    // Prepare S3 delete requests for multiple objects
    const objectsToDelete = videoIds.map((videoId) => ({
      Key: videoId.toString(),
    }));

    const bucketParams = {
      Bucket: s3VideoBucket,
      Delete: {
        Objects: objectsToDelete,
      },
    };

    const s3Response = await s3Client.send(
      new DeleteObjectsCommand(bucketParams)
    );

    // Delete the videos from the database
    const deletedVideos = await Video.deleteMany({ _id: { $in: videoIds } });
    if (deletedVideos.deletedCount === 0) {
      return res.status(404).json({ error: "No videos found to delete." });
    }

    res.status(200).json({
      success: true,
      message: `${deletedVideos.deletedCount} videos deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
