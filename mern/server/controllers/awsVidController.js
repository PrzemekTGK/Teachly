// Import AWS S3 client and commands for object operations
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
// Import AWS credential provider
import { fromEnv } from "@aws-sdk/credential-providers";
// Import function to generate pre-signed URLs
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// Import Video model for database operations
import Video from "../models/videoModel.js";

// Define S3 bucket name for video storage
const s3VideoBucket = "teachlyvideos";
// Initialize S3 client with region and environment credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

// Upload a video to S3 and save metadata to database
export const uploadVideo = async (req, res) => {
  // Extract metadata and file from request body
  const { title, description, uploaderId, uploader } = req.body;
  const file = req.files[0];

  // Validate title presence
  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  try {
    // Check for existing video with the same title
    const existingVideo = await Video.findOne({ title: title });

    // Return error if video title already exists
    if (existingVideo) {
      return res
        .status(400)
        .json({ message: "A video with this title already exists" });
    }

    // Create new video document
    const newVideo = new Video({
      title: title,
      description: description,
      uploaderId: uploaderId,
      uploader: uploader,
      ContentType: "video/mp4",
      ACL: "private",
    });

    // Save video metadata to database
    await newVideo.save();

    // Define S3 upload parameters
    const bucketParams = {
      Bucket: s3VideoBucket,
      Key: newVideo._id.toString(),
      Body: file.buffer,
    };

    // Upload video to S3
    const s3Response = await s3Client.send(new PutObjectCommand(bucketParams));

    // Return success response with video metadata and S3 response
    res
      .status(200)
      .json({ success: true, video: newVideo, s3Data: s3Response });
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ error: error.message });
  }
};

// Retrieve videos with pre-signed URLs
export const getVideos = async (req, res) => {
  try {
    // Extract uploaderId from query parameters
    const { uploaderId } = req.query;

    // Define filter based on uploaderId, or fetch all videos if not provided
    const filter = uploaderId ? { uploaderId } : {};

    // Find videos matching the filter
    const videos = await Video.find(filter);

    // Generate pre-signed URLs for each video
    const videosWithUrls = await Promise.all(
      videos.map(async (video) => {
        const command = new GetObjectCommand({
          Bucket: s3VideoBucket,
          Key: video._id.toString(),
        });
        // Generate pre-signed URL, expires in 1 hour
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return {
          ...video.toObject(),
          url,
        };
      })
    );

    // Return success response with videos and their URLs
    res.status(200).json(videosWithUrls);
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ error: error.message });
  }
};

// Delete a single video from S3 and database
export const deleteVideo = async (req, res) => {
  // Extract video ID from request parameters
  const videoId = req.params.id;
  // Validate video ID presence
  if (!videoId) {
    return res.status(400).json({ error: "Video ID is required." });
  }

  try {
    // Define S3 delete parameters
    const bucketParams = {
      Bucket: s3VideoBucket,
      Key: videoId.toString(),
    };

    // Delete video from S3
    await s3Client.send(new DeleteObjectCommand(bucketParams));

    // Delete video metadata from database
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    // Return error if video not found
    if (!deletedVideo) {
      return res.status(404).json({ error: "Video not found." });
    }

    // Return success response
    res
      .status(200)
      .json({ success: true, message: "Video deleted successfully." });
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ error: error.message });
  }
};

// Delete multiple videos from S3 and database
export const deleteVideos = async (req, res) => {
  // Extract array of video IDs from request body
  const { videoIds } = req.body;
  // Validate video IDs presence and format
  if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
    return res.status(400).json({ error: "Video IDs are required." });
  }

  try {
    // Prepare S3 delete requests for multiple objects
    const objectsToDelete = videoIds.map((videoId) => ({
      Key: videoId.toString(),
    }));

    // Define S3 bulk delete parameters
    const bucketParams = {
      Bucket: s3VideoBucket,
      Delete: {
        Objects: objectsToDelete,
      },
    };

    // Delete videos from S3
    const s3Response = await s3Client.send(
      new DeleteObjectsCommand(bucketParams)
    );

    // Delete video metadata from database
    const deletedVideos = await Video.deleteMany({ _id: { $in: videoIds } });
    // Return error if no videos were deleted
    if (deletedVideos.deletedCount === 0) {
      return res.status(404).json({ error: "No videos found to delete." });
    }

    // Return success response with count of deleted videos
    res.status(200).json({
      success: true,
      message: `${deletedVideos.deletedCount} videos deleted successfully.`,
    });
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ error: error.message });
  }
};
