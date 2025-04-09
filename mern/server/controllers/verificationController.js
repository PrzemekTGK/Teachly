import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const checkPassword = async (req, res) => {
  const { userId, currentPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Compare hashed password
    const isMatch = await bcryptjs.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Password is correct" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // ✅ Compare hashed password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ success: true, data: token });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyToken = async (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authantication token is missing!" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (error, user) => {
    try {
      req.body.user = user;
      next();
    } catch (error) {
      return res
        .status(403)
        .json({ message: `Authantication token is invalid! ${error.message}` });
    }
  });
};
