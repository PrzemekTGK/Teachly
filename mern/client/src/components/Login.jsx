// Import verifyUser API function for authentication
import { verifyUser } from "../api";
// Import useState hook for managing component state
import { useState } from "react";
// Import useNavigate for programmatic navigation
import { useNavigate } from "react-router-dom";
// Import jwtDecode for decoding JWT tokens
import { jwtDecode } from "jwt-decode";
// Import axios for HTTP requests
import axios from "axios";

// Define Login component with modalState and setModalState props
export default function Login({ modalState, setModalState }) {
  // Initialize user state for form inputs
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  // Initialize state for error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Initialize navigation function
  const navigate = useNavigate();

  // Update user state when form inputs change
  function updateHandler(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  // Handle form submission for user login
  async function loginHandler(e) {
    e.preventDefault();

    // Clear previous error and success messages
    setError("");
    setSuccess("");

    try {
      // Attempt to verify user credentials via API
      const response = await verifyUser(user);

      if (response.success) {
        // Set success message
        setSuccess("User logged in successfully!");
        // Close modal
        setModalState(!modalState);
        // Store JWT token in session storage
        sessionStorage.setItem("User", response.data);
        // Decode token to extract user data
        const decodedUser = jwtDecode(response.data);
        // Store stream key in session storage
        const streamKey = decodedUser.streamKey;
        sessionStorage.setItem("StreamKey", streamKey);
        // Set default Authorization header for axios
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.token}`;
        // Navigate to home and refresh page
        navigate("/", { replace: true });
        navigate(0);
      } else {
        // Set error message from API response
        setError(response.message);
      }
    } catch (error) {
      // Set error message for API failure
      setError(error.message || "An unexpected error occurred.");
    }
  }

  return (
    <>
      {/* Render login form container */}
      <div className="login-body">
        {/* Render form with submission handler */}
        <div className="reg-form" onSubmit={updateHandler}>
          <form onSubmit={loginHandler}>
            {/* Input for email */}
            <input
              className="reg-input"
              placeholder="E-mail"
              onChange={updateHandler}
              name="email"
              required
              maxLength={40}
            />
            {/* Input for password */}
            <input
              type="password"
              className="reg-input"
              placeholder="Password"
              onChange={updateHandler}
              name="password"
              required
              maxLength={20}
            />
            {/* Submit button for login */}
            <button className="submit-button" type="submit">
              Login
            </button>
          </form>
          {/* Display error message if present */}
          {error && <p className="error-message">{error}</p>}
          {/* Display success message if present */}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    </>
  );
}
