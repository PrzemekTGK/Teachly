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

const allowedOrigins = [
  "https://teachly-backend.up.railway.app",
  "https://teachly.up.railway.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
const upload = multer();

const server = createServer(app);
const clients = initializeWebSocket(server);
app.set("wssClients", clients);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.any());

app.use("/api/users", userRouter);
app.use("/api/images", awsImgRouter);
app.use("/api/videos", awsVidRouter);
app.use("/api/stream", streamRouter);

server.listen(PORT, "0.0.0.0", () => {
  connectDB();
  console.log(`Server started on port `, PORT);
});
