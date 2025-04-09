import express from "express";
import { verifyToken } from "../controllers/verificationController.js";
import {
  publishStream,
  streamProxy,
  validateStreamKey,
} from "../controllers/streamController.js";

const streamRouter = express.Router();

streamRouter.use("/hls", verifyToken, streamProxy);
streamRouter.all("/validate-stream-key", verifyToken, validateStreamKey);
streamRouter.post("/publish-stream", verifyToken, publishStream);

export default streamRouter;
