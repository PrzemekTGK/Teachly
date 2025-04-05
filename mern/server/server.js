import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter.js";
import awsImgRouter from "./routes/awsImgRouter.js";
import awsVidRouter from "./routes/awsVidRouter.js";
import { connectDB } from "./config/db.js";
import multer from "multer";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const upload = multer();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow only localhost for testing
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.any());

app.use("/api/users", userRouter);
app.use("/api/images", awsImgRouter);
app.use("/api/videos", awsVidRouter);

app.listen(PORT, "0.0.0.0", () => {
  connectDB();
});
