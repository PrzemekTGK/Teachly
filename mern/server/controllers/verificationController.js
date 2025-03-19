import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const verifyUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ success: true, data: token });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
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
