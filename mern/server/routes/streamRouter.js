import express from "express";
import {
  streamProxy,
  validateStreamKey,
} from "../controllers/streamController.js";

const streamRouter = express.Router();

streamRouter.use("/hls", streamProxy);
streamRouter.all("/validate-stream-key", validateStreamKey);

export default streamRouter;
