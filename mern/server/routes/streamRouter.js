// streamRouter.js
import express from "express";
import { streamProxy } from "../controllers/streamController.js";

const streamRouter = express.Router();

streamRouter.use("/hls", streamProxy);

export default streamRouter;
