// Import AWS S3 client and commands for object operations
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
// Import AWS credential provider
import { fromEnv } from "@aws-sdk/credential-providers";

// Define S3 bucket name for image storage
const s3ImageBucket = "teachlyimages";
// Initialize S3 client with region and environment credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

// Upload an image to S3
export const uploadImage = async (req, res) => {
  // Extract file from request
  const file = req.files[0];

  // Define S3 upload parameters
  const bucketParams = {
    Bucket: s3ImageBucket,
    Key: file.originalname,
    Body: file.buffer,
  };

  try {
    // Upload image to S3
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    // Return success response with S3 data
    res.status(200).json(data);
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ error: error.message });
  }
};

// Retrieve an image from S3 and return as base64 string
export const getImage = async (req, res) => {
  // Extract image ID from request parameters
  const imageId = req.params.id;

  // Validate image ID presence
  if (!imageId) {
    return res.status(400).json({ error: "Image ID is required." });
  }

  // Define S3 get object parameters
  const bucketParams = {
    Bucket: s3ImageBucket,
    Key: imageId,
  };

  try {
    // Retrieve image from S3
    const data = await s3Client.send(new GetObjectCommand(bucketParams));
    // Extract content type
    const contentType = data.ContentType;
    // Convert image data to base64 string
    const srcString = await data.Body.transformToString("base64");
    // Create data URI for image
    const imageSource = `data:${contentType};base64, ${srcString}`;
    // Return success response with base64 image source
    res.status(200).json(imageSource);
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ error: error.message });
  }
};

// Delete an image from S3
export const deleteImage = async (req, res) => {
  // Extract image ID from request parameters
  const imageId = req.params.id;

  // Validate image ID presence
  if (!imageId) {
    return res.status(400).json({ error: "Image ID is required." });
  }

  // Define S3 delete parameters
  const bucketParams = {
    Bucket: s3ImageBucket,
    Key: imageId,
  };

  try {
    // Delete image from S3
    const data = await s3Client.send(new DeleteObjectCommand(bucketParams));
    // Return success response with S3 data
    res.status(200).json(data);
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ error: error.message });
  }
};
