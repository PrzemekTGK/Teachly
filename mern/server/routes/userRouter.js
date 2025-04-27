// Import Express framework for creating the router
import express from "express";

// Import controller functions for user-related operations
import {
  changePassword, // Handles password change for a user
  createUser, // Creates a new user
  deleteUser, // Deletes a user by ID
  getUser, // Retrieves a single user by ID
  getUsers, // Retrieves a list of users
  updateUser, // Updates user information
} from "../controllers/userController.js";

// Import middleware functions for authentication and verification
import {
  verifyToken, // Verifies JWT token for protected routes
  verifyUser, // Verifies user credentials for login
  checkPassword, // Verifies the current password before allowing changes
} from "../controllers/verificationController.js";

// Initialize an Express router instance
const userRouter = express.Router();

// Route to create a new user (public, no authentication required)
userRouter.post("/", createUser);

// Route for user login (public, verifies user credentials)
userRouter.post("/login", verifyUser);

// Route to check the current password (protected, requires valid token)
userRouter.post("/check-password", verifyToken, checkPassword);

// Route to change a user's password (protected, requires valid token)
userRouter.put("/change-password", verifyToken, changePassword);

// Route to update a user's information by ID (protected, requires valid token)
userRouter.put("/:id", verifyToken, updateUser);

// Route to get a list of users (protected, requires valid token)
userRouter.get("/", verifyToken, getUsers);

// Route to get a single user by ID (protected, requires valid token)
userRouter.get("/:id", verifyToken, getUser);

// Route to delete a user by ID (protected, requires valid token)
userRouter.delete("/:id", verifyToken, deleteUser);

// Export the router for use in the main application
export default userRouter;
