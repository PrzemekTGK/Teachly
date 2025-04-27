// Import User model for database operations
import User from "../models/userModel.js";
// Import Mongoose for ObjectId validation
import mongoose from "mongoose";
// Import jsonwebtoken for token generation
import jwt from "jsonwebtoken";

// Retrieve all users from the database
export const getUsers = async (req, res) => {
  try {
    // Find all users
    const users = await User.find({});
    // Return success response with users data
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Retrieve a single user by ID
export const getUser = async (req, res) => {
  // Extract user ID from request parameters
  const { id } = req.params;
  try {
    // Find user by ID
    const users = await User.findById(id);
    // Return success response with user data
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  // Extract user data from request body
  const user = req.body;

  // Validate required fields
  if (!user.username || !user.email || !user.password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  // Check for existing username
  const existingUserName = await User.findOne({ username: user.username });
  // Check for existing email
  const existingEmail = await User.findOne({ email: user.email });

  // Return error if email is already in use
  if (existingEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Email is already in use" });
  } else if (existingUserName) {
    // Return error if username is already in use
    return res
      .status(400)
      .json({ success: false, message: "User Name is already in use" });
  } else {
    // Create new user instance
    const newUser = new User(user);

    try {
      // Save new user to database
      await newUser.save();
      // Remove password from user data for token
      const { password, ...userWithoutPassword } = newUser.toObject();
      // Generate JWT token with user data
      const token = jwt.sign(userWithoutPassword, process.env.SECRET_KEY);
      // Return success response with token
      res.status(201).json({ success: true, token });
    } catch (error) {
      // Return error for user creation failure
      res
        .status(500)
        .json({ success: false, message: "Error creating new user!" });
    }
  }
};

// Update an existing user
export const updateUser = async (req, res) => {
  // Extract user ID from request parameters
  const { id } = req.params;
  // Extract updated user data from request body
  const user = req.body;

  // Validate user ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid User ID!" });
  }

  try {
    // Update user by ID and return updated document
    const updatedUser = await User.findByIdAndUpdate(id, user, {
      new: true,
    }).lean();
    // Generate JWT token with updated user data
    const token = jwt.sign(updatedUser, process.env.SECRET_KEY);
    // Return success response with token
    res.status(200).json({ success: true, token });
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  // Extract user ID from request parameters
  const { id } = req.params;

  // Validate user ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid User ID!" });
  }

  try {
    // Delete user by ID
    await User.findByIdAndDelete(id);
    // Return success response
    res.status(200).json({ success: true, message: "User Deleted!" });
  } catch (error) {
    // Return server error for any exceptions
    res.status(500).json({ success: false, message: "Server Error!" });
  }
};

// Change a user's password
export const changePassword = async (req, res) => {
  // Extract userId and newPassword from request body
  const { userId, newPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);
    // Return error if user not found
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    // Update user's password
    user.password = newPassword;
    // Save updated user (triggers pre-save password hashing)
    await user.save();
    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // Return server error for any exceptions
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
