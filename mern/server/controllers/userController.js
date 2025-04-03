import User from "../models/userModel.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const users = await User.findById(id);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

export const createUser = async (req, res) => {
  const user = req.body; // user input data in the front end

  if (!user.username || !user.email || !user.password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  const existingUserName = await User.findOne({ username: user.username });
  const existingEmail = await User.findOne({ email: user.email });

  if (existingEmail) {
    return res
      .status(400)
      .json({ success: false, message: "Email is already in use" });
  } else if (existingUserName) {
    return res
      .status(400)
      .json({ success: false, message: "User Name is already in use" });
  } else {
    const newUser = new User(user);

    try {
      await newUser.save();

      // Exclude password and confirmPassword from the user object
      const { password, ...userWithoutPassword } = newUser.toObject();
      const token = jwt.sign(userWithoutPassword, process.env.SECRET_KEY);
      res.status(201).json({ success: true, token });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error creating new user!" });
    }
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = req.body; // user input data in the front end

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid User ID!" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, user, {
      new: true,
    }).lean();
    const token = jwt.sign(updatedUser, process.env.SECRET_KEY);
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid User ID!" });
  }

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User Deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error!" });
  }
};

export const changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Update the password
    user.password = newPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
