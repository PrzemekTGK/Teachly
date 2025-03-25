import express from "express";
import { verifyToken } from "../controllers/verificationController.js";
import {
  uploadVideo,
  getVideos,
  deleteVideo,
  deleteVideos,
} from "../controllers/awsVidController.js";

const awsVidRouter = express.Router();

awsVidRouter.post("/upload", verifyToken, uploadVideo);
awsVidRouter.get("/", getVideos);
awsVidRouter.delete("/:id", verifyToken, deleteVideo);
awsVidRouter.post("/delete", verifyToken, deleteVideos);

export default awsVidRouter;
