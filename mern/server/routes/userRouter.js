import express from "express";
import {
  changePassword,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import {
  verifyToken,
  verifyUser,
  checkPassword,
  validateStreamKey,
} from "../controllers/verificationController.js";

import { proxyHLS } from "../controllers/streamController.js";

const userRouter = express.Router();

userRouter.all("/validate-stream-key", validateStreamKey);
userRouter.post("/", createUser);
userRouter.post("/login", verifyUser);
userRouter.post("/check-password", verifyToken, checkPassword);
userRouter.put("/change-password", verifyToken, changePassword);
userRouter.put("/:id", verifyToken, updateUser);
userRouter.get("/", verifyToken, getUsers);
userRouter.get("/:id", verifyToken, getUser);
userRouter.get("/hls/:file", verifyToken, proxyHLS);
userRouter.delete("/:id", verifyToken, deleteUser);

export default userRouter;
