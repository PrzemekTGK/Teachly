import express from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import {
  verifyToken,
  verifyUser,
} from "../controllers/verificationController.js";

const userRouter = express.Router();

userRouter.get("/", verifyToken, getUsers);
userRouter.get("/:id", verifyToken, getUser);
userRouter.post("/", createUser);
userRouter.put("/:id", verifyToken, updateUser);
userRouter.delete("/:id", verifyToken, deleteUser);
userRouter.post("/login", verifyUser);

export default userRouter;
