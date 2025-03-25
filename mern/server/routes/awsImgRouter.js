import express from "express";
import { verifyToken } from "../controllers/verificationController.js";
import {
  uploadImage,
  deleteImage,
  getImage,
} from "../controllers/awsImgController.js";

const awsImgRouter = express.Router();

awsImgRouter.post("/upload", verifyToken, uploadImage);
awsImgRouter.get("/:id", verifyToken, getImage);
awsImgRouter.delete("/delete/:id", verifyToken, deleteImage);

export default awsImgRouter;
