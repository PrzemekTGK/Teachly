import express from "express";
import {
  getStreams,
  getStream,
  streamProxy,
  publishStream,
  deleteStream,
  validateStreamKey,
} from "../controllers/streamController.js";

const streamRouter = express.Router();

streamRouter.get("/get-streams", getStreams);
streamRouter.get("/get-stream/:streamKey", getStream);
streamRouter.use("/hls", streamProxy);
streamRouter.post("/publish-stream", publishStream);
streamRouter.delete("/delete-stream", deleteStream);
streamRouter.all("/validate-stream-key", validateStreamKey);

export default streamRouter;
