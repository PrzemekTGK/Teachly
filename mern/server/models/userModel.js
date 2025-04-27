// Import Mongoose for MongoDB schema creation
import mongoose from "mongoose";
// Import bcryptjs for password hashing
import bcryptjs from "bcryptjs";

// Define the user schema for storing user information
const userSchema = mongoose.Schema({
  // ID of the user's profile image, optional field
  imageId: {
    type: String,
    required: false,
  },
  // User's first name, optional field
  firstname: {
    type: String,
    required: false,
  },
  // User's last name, optional field
  lastname: {
    type: String,
    required: false,
  },
  // User's username, required field
  username: {
    type: String,
    required: true,
  },
  // User's email, required and must be unique
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // User's password, required field
  password: {
    type: String,
    required: true,
  },
  // User's role, restricted to "creator" or "viewer"
  role: {
    type: String,
    enum: ["creator", "viewer"],
  },
  // Date the user joined, defaults to current date/time
  date_joined: {
    type: Date,
    default: Date.now,
  },
  // Stream key for creators, optional field
  streamKey: {
    type: String,
    required: false, // Stream key is only needed for creators
  },
});

// Pre-save middleware to hash the password before saving the user document
userSchema.pre("save", async function (next) {
  // Check if the password field has been modified
  if (this.isModified("password")) {
    // Only hash if the password is modified
    try {
      // Generate a salt with 10 rounds
      const salt = await bcryptjs.genSalt(10);
      // Hash the password with the generated salt
      this.password = await bcryptjs.hash(this.password, salt);
      // Proceed with saving the document
      next();
    } catch (error) {
      // Pass any errors to the next middleware
      next(error);
    }
  } else {
    // If password isn't modified, proceed without hashing
    next();
  }
});

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

// Export the User model for use in other parts of the application
export default User;
