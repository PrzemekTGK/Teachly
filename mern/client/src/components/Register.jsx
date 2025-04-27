// Import API functions for user creation and password validation
import { createUser, validatePassword } from "../api";
// Import React hook for state management
import { useState } from "react";
// Import navigation hook from react-router
import { useNavigate } from "react-router-dom";
// Import axios for HTTP requests
import axios from "axios";

// Define Register component
export default function Register({ modalState, setModalState }) {
  // State for storing user registration details
  const [user, setUser] = useState({
    imageId: "",
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });

  // State for displaying error messages
  const [error, setError] = useState("");
  // State for displaying success messages
  const [success, setSuccess] = useState("");
  // Initialize navigation function
  const navigate = useNavigate();

  // Handle form input changes and update user state
  function updateHandler(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  // Validate email format using regex
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  // Handle user registration form submission
  async function registerNewUser(e) {
    e.preventDefault();

    // Reset error and success messages
    setError("");
    setSuccess("");

    // Validate password match
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Validate email format
    if (!validateEmail(user.email)) {
      setError("Enter a Valid Email!!");
      return;
    }

    // Validate password strength
    if (!validatePassword(user.password)) {
      setError(
        "Password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    try {
      // Exclude confirmPassword field before sending data
      const { confirmPassword, ...userWithoutConfirm } = user;
      // Call API to create new user
      let newUser = await createUser(userWithoutConfirm);

      // Handle successful user creation
      if (newUser.data.success) {
        setSuccess("User created successfully!");
        setModalState(!modalState); // Close registration modal
        sessionStorage.setItem("User", newUser.data.token); // Store user token
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newUser.token}`; // Set default authorization header
        navigate("../profile"); // Navigate to user profile
      } else {
        setError(newUser.data.message); // Display error message from backend
      }
    } catch (error) {
      // Handle registration errors
      if (error.response && error.response.data) {
        setError(
          error.response.data.message || "An error occurred. Please try again."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  }

  return (
    <>
      {/* Render registration form container */}
      <div className="register-body">
        <div>
          {/* Render registration form */}
          <form className="reg-form" onSubmit={registerNewUser}>
            {/* Username input field */}
            <input
              className="reg-input"
              placeholder="User Name"
              name="username"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            {/* Email input field */}
            <input
              className="reg-input"
              placeholder="E-mail"
              name="email"
              onChange={updateHandler}
              maxLength={40}
              required
            />
            {/* Password input field */}
            <input
              type="password"
              className="reg-input"
              placeholder="Password"
              name="password"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            {/* Confirm password input field */}
            <input
              type="password"
              className="reg-input"
              placeholder="Confirm Password"
              name="confirmPassword"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            {/* Submit registration button */}
            <button className="submit-button register-button" type="submit">
              Register
            </button>
          </form>
          {/* Display error message if any */}
          {error && <p className="error-message">{error}</p>}
          {/* Display success message if any */}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    </>
  );
}
