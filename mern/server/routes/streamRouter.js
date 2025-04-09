import express from "express";
import {
  publishStream,
  streamProxy,
  validateStreamKey,
} from "../controllers/streamController.js";

const streamRouter = express.Router();

streamRouter.use("/hls", streamProxy);
streamRouter.all("/validate-stream-key", validateStreamKey);
streamRouter.post("/publish-stream", publishStream);

export default streamRouter;
