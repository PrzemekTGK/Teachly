import { checkPassword, changePassword, validatePassword } from "../api";
import { useState } from "react";

export default function ChangePasswordModal({ modalState, setModalState }) {
  const [userState, setUserState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateHandler(e) {
    setUserState({ ...userState, [e.target.name]: e.target.value });
  }

  // Handle the change in current password
  function handleCurrentPasswordInputUpdate(e) {
    const currentPassword = e.target.value;
    setUserState({ ...userState, currentPassword });

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to call the API after a delay (e.g., 1 second)
    const timeout = setTimeout(async () => {
      const isValid = await checkPassword(currentPassword);
      if (!isValid) {
        setPasswordMatch(false);
        setSuccess("");
        setError("Current password is incorrect.");
      } else {
        setPasswordMatch(true);
        setError(""); // Clear the error if password is correct
        setSuccess("Current password is correct.");
      }
    }, 1000); // 1000ms debounce time (1 second)

    // Store the timeout reference
    setTypingTimeout(timeout);
  }

  async function handleChangePassword(e) {
    e.preventDefault(); // Prevent default form submission behavior

    setError("");
    setSuccess("");

    if (userState.newPassword !== userState.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!passwordMatch) {
      setError("Current password is incorrect!!!");
      return;
    }

    if (!validatePassword(userState.newPassword)) {
      setError(
        "Password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    if (userState.newPassword === userState.currentPassword) {
      setError("Password cannot be the same as current password!");
      return;
    }

    try {
      const response = await changePassword(userState.newPassword);
      setModalState(!modalState);
      setSuccess(response.message);
    } catch (error) {
      setError(error.message || "Error updating password");
    }
  }

  return (
    <>
      <div className="modal-background">
        <div className="modal-container">
          <div className="close-modal-button">
            <button
              onClick={() => {
                setModalState(!modalState);
              }}
            >
              X
            </button>
          </div>
          <div className="modal-bar">
            <h2>Change Password</h2>
          </div>
          <form className="reg-form" onSubmit={handleChangePassword}>
            <input
              type="password"
              className="reg-input"
              placeholder="Current Password"
              name="currentPassword"
              onChange={handleCurrentPasswordInputUpdate}
              maxLength={20}
              required
            />
            <input
              type="password"
              className="reg-input"
              placeholder="New Password"
              name="newPassword"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            <input
              type="password"
              className="reg-input"
              placeholder="Confirm Password"
              name="confirmPassword"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            <button className="submit-button" type="submit">
              Update Password
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    </>
  );
}
