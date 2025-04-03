import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";

const s3ImageBucket = "teachlyimages";
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

export const uploadImage = async (req, res) => {
  // Ensure you're using the parameters passed into the function (req, res)
  const file = req.files[0];

  const bucketParams = {
    Bucket: s3ImageBucket, // make sure s3Bucket is defined or imported in this file
    Key: file.originalname,
    Body: file.buffer,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getImage = async (req, res) => {
  const imageId = req.params.id;

  if (!imageId) {
    // Return a 400 Bad Request response if imageId is missing.
    return res.status(400).json({ error: "Image ID is required." });
  }

  const bucketParams = {
    Bucket: s3ImageBucket, // make sure s3Bucket is defined or imported in this file
    Key: imageId,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(bucketParams));
    const contentType = data.ContentType;
    const srcString = await data.Body.transformToString("base64");
    const imageSource = `data:${contentType};base64, ${srcString}`;
    res.status(200).json(imageSource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  const imageId = req.params.id;

  if (!imageId) {
    // Return a 400 Bad Request response if imageId is missing.
    return res.status(400).json({ error: "Image ID is required." });
  }

  const bucketParams = {
    Bucket: s3ImageBucket, // make sure s3Bucket is defined or imported in this file
    Key: imageId,
  };

  try {
    const data = await s3Client.send(new DeleteObjectCommand(bucketParams));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
