// Import User model for database operations
import User from "../models/userModel.js";
// Import bcryptjs for password comparison
import bcryptjs from "bcryptjs";
// Import jsonwebtoken for token creation and verification
import jwt from "jsonwebtoken";

// Validate user's current password
export const checkPassword = async (req, res) => {
  // Extract userId and currentPassword from request body
  const { userId, currentPassword } = req.body;

  try {
    // Find user by ID in the database
    const user = await User.findById(userId);

    // Return error if user not found
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcryptjs.compare(currentPassword, user.password);

    // Return error if passwords do not match
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Return success response if password is correct
    return res
      .status(200)
      .json({ success: true, message: "Password is correct" });
  } catch (error) {
    // Return server error for any exceptions
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Authenticate user and issue JWT token
export const verifyUser = async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  try {
    // Find user by email, using lean for performance
    const user = await User.findOne({ email }).lean();

    // Return error if user not found
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcryptjs.compare(password, user.password);
    // Return error if passwords do not match
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token with user data, signed with secret key, expires in 1 hour
    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: "1h" });
    // Return success response with token
    return res.status(200).json({ success: true, data: token });
  } catch (error) {
    // Return server error for any exceptions
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  // Extract authorization header
  const authHeaders = req.headers["authorization"];
  // Extract token from Bearer scheme
  const token = authHeaders && authHeaders.split(" ")[1];

  // Return error if token is missing
  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token is missing!" });
  }

  // Verify token with secret key
  jwt.verify(token, process.env.SECRET_KEY, (error, user) => {
    try {
      // Attach decoded user data to request body
      req.body.user = user;
      // Proceed to next middleware
      next();
    } catch (error) {
      // Return error if token is invalid
      return res
        .status(403)
        .json({ message: `Authentication token is invalid! ${error.message}` });
    }
  });
};
