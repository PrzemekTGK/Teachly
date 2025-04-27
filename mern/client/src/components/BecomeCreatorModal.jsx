// Import useState hook for managing component state
import { useState } from "react";
// Import jwtDecode for decoding JWT tokens
import { jwtDecode } from "jwt-decode";
// Import updateUser API function
import { updateUser } from "../api";
// Import axios for HTTP requests
import axios from "axios";

// Define BecomeCreatorModal component with modalState, setModalState, and onRoleUpdate props
export default function BecomeCreatorModal({
  modalState,
  setModalState,
  onRoleUpdate,
}) {
  // Initialize user state for form inputs
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    role: "creator",
    streamKey: "",
  });
  // Initialize state for error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generate a unique stream key based on username
  function generateStreamKey(username) {
    return `${username}-${Math.random().toString(36).substr(2, 9)}`; // Example: username-randomKey
  }

  // Update user state when form inputs change
  function updateHandler(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  // Handle form submission to update user as creator
  async function handleBecomeCreator(e) {
    e.preventDefault();

    // Clear previous error and success messages
    setError("");
    setSuccess("");

    // Retrieve and decode JWT token from session storage
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const userId = decodedUser._id;
    const newRole = user.role;
    // Generate stream key using username
    const streamKey = generateStreamKey(decodedUser.username);

    try {
      // Prepare updated user data
      const updatedUser = {
        firstname: user.firstname,
        lastname: user.lastname,
        role: newRole,
        streamKey: streamKey,
      };
      // Set Authorization header with Bearer token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Update user via API call
      const response = await updateUser(userId, updatedUser);

      // Extract new token and decode it
      const newToken = response.data.token;
      const newUser = jwtDecode(newToken);
      // Store new token and stream key in session storage
      sessionStorage.setItem("User", newToken);
      sessionStorage.setItem("StreamKey", newUser.streamKey);

      // Notify parent component of role update
      onRoleUpdate(newRole);
      // Close modal
      setModalState(false);

      // Set success message
      setSuccess("User updated successfully!");
    } catch (error) {
      // Handle API errors and set error message
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
    // Render modal background
    <div className="modal-background">
      {/* Render modal container */}
      <div className="modal-container">
        {/* Render close button section */}
        <div className="close-modal-button">
          {/* Button to toggle modal visibility */}
          <button
            onClick={() => {
              setModalState(!modalState);
            }}
          >
            X
          </button>
        </div>
        {/* Render modal title */}
        <div className="modal-bar">
          <h2>Become Creator</h2>
        </div>
        {/* Render form for becoming a creator */}
        <form className="reg-form" onSubmit={handleBecomeCreator}>
          {/* Input for first name */}
          <input
            className="reg-input"
            placeholder="First Name"
            name="firstname"
            onChange={updateHandler}
            maxLength={20}
            required
          />
          {/* Input for last name */}
          <input
            className="reg-input"
            placeholder="Last Name"
            name="lastname"
            onChange={updateHandler}
            maxLength={20}
            required
          />
          {/* Submit button for form */}
          <button className="submit-button" type="submit">
            Submit
          </button>
        </form>
        {/* Display error message if present */}
        {error && <p className="error-message">{error}</p>}
        {/* Display success message if present */}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
}
