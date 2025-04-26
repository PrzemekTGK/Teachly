import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter.js";
import awsImgRouter from "./routes/awsImgRouter.js";
import awsVidRouter from "./routes/awsVidRouter.js";
import streamRouter from "./routes/streamRouter.js";
import { connectDB } from "./config/db.js";
import { createServer } from "http";
import { initializeWebSocket } from "./websocket.js";
import multer from "multer";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const upload = multer();
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);

const server = createServer(app);
const clients = initializeWebSocket(server);
app.set("wssClients", clients);

app.use(
  cors({
    origin: "https://teachly.up.railway.app",
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
    credentials: true,
  })
);
app.use(upload.any());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/images", awsImgRouter);
app.use("/api/videos", awsVidRouter);
app.use("/api/users", userRouter);
app.use("/api/stream", streamRouter);

server.listen(PORT, "0.0.0.0", () => {
  connectDB();
  console.log(`Server started on port `, PORT);
});
