import express from "express";
import {
  publishStream,
  streamProxy,
  validateStreamKey,
  getStreams,
  deleteStream,
} from "../controllers/streamController.js";

const streamRouter = express.Router();

streamRouter.get("/get-streams", getStreams);
streamRouter.use("/hls", streamProxy);
streamRouter.all("/validate-stream-key", validateStreamKey);
streamRouter.post("/publish-stream", publishStream);
streamRouter.delete("/stream/delete/:streamKey", deleteStream);

export default streamRouter;
