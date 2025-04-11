import express from "express";
import {
  publishStream,
  streamProxy,
  validateStreamKey,
  getStreams,
} from "../controllers/streamController.js";

const streamRouter = express.Router();

streamRouter.get("/get-streams", getStreams);
streamRouter.use("/hls", streamProxy);
streamRouter.all("/validate-stream-key", validateStreamKey);
streamRouter.post("/publish-stream", publishStream);

export default streamRouter;
