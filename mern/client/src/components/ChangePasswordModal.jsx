// Import API functions for password operations
import { checkPassword, changePassword, validatePassword } from "../api";
// Import useState hook for managing component state
import { useState } from "react";

// Define ChangePasswordModal component with modalState and setModalState props
export default function ChangePasswordModal({ modalState, setModalState }) {
  // Initialize user state for password inputs
  const [user, setUser] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // Initialize state for debouncing password check
  const [typingTimeout, setTypingTimeout] = useState(null);
  // Initialize state for tracking current password validity
  const [passwordMatch, setPasswordMatch] = useState(false);
  // Initialize state for success and error messages
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Update user state for form inputs
  function updateHandler(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  // Handle current password input with debounced API check
  function handleCurrentPasswordInputUpdate(e) {
    // Update current password in user state
    const currentPassword = e.target.value;
    setUser({ ...user, currentPassword });

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to check password after 1 second
    const timeout = setTimeout(async () => {
      // Validate current password via API
      const isValid = await checkPassword(currentPassword);
      if (!isValid) {
        // Set error if password is incorrect
        setPasswordMatch(false);
        setSuccess("");
        setError("Current password is incorrect.");
      } else {
        // Set success if password is correct
        setPasswordMatch(true);
        setError("");
        setSuccess("Current password is correct.");
      }
    }, 1000); // 1000ms debounce time

    // Store timeout reference
    setTypingTimeout(timeout);
  }

  // Handle form submission to change password
  async function handleChangePassword(e) {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Validate new and confirm passwords match
    if (user.newPassword !== user.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    // Validate current password correctness
    if (!passwordMatch) {
      setError("Current password is incorrect!!!");
      return;
    }

    // Validate new password strength
    if (!validatePassword(user.newPassword)) {
      setError(
        "Password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    // Prevent reusing current password
    if (user.newPassword === user.currentPassword) {
      setError("Password cannot be the same as current password!");
      return;
    }

    try {
      // Update password via API
      const response = await changePassword(user.newPassword);
      // Close modal on success
      setModalState(!modalState);
      // Set success message
      setSuccess(response.message);
    } catch (error) {
      // Set error message for API failure
      setError(error.message || "Error updating password");
    }
  }

  return (
    <>
      {/* Render modal background */}
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
            <h2>Change Password</h2>
          </div>
          {/* Render password change form */}
          <form className="reg-form" onSubmit={handleChangePassword}>
            {/* Input for current password with debounced validation */}
            <input
              type="password"
              className="reg-input"
              placeholder="Current Password"
              name="currentPassword"
              onChange={handleCurrentPasswordInputUpdate}
              maxLength={20}
              required
            />
            {/* Input for new password */}
            <input
              type="password"
              className="reg-input"
              placeholder="New Password"
              name="newPassword"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            {/* Input for confirming new password */}
            <input
              type="password"
              className="reg-input"
              placeholder="Confirm Password"
              name="confirmPassword"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            {/* Submit button for form */}
            <button className="submit-button" type="submit">
              Update Password
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
