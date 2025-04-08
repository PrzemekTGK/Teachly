import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { updateUser } from "../api";
import axios from "axios";
export default function BecomeCreatorModal({
  modalState,
  setModalState,
  onRoleUpdate,
}) {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    role: "creator",
    streamKey: "",
  });
  const [error, setError] = useState(""); // For error messages
  const [success, setSuccess] = useState(""); // For success messages

  function generateStreamKey(username) {
    return `${username}-${Math.random().toString(36).substr(2, 9)}`; // Example: username-randomKey
  }

  function updateHandler(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  async function handleBecomeCreator(e) {
    e.preventDefault(); // Prevent default form submission behavior

    // Reset success and error messages on each submission attempt
    setError("");
    setSuccess("");
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const userId = decodedUser._id;
    const newRole = user.role;
    const streamKey = generateStreamKey(decodedUser.username);

    try {
      const updatedUser = {
        firstname: user.firstname,
        lastname: user.lastname,
        role: newRole,
        streamKey: streamKey,
      };
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await updateUser(userId, updatedUser);

      // Use the token returned by the backend; no need to encode manually
      const newToken = response.data.token;
      const newUser = jwtDecode(newToken);
      console.log(newUser);
      sessionStorage.setItem("User", newToken);
      sessionStorage.setItem("StreamKey", newUser.streamKey);

      // Call the onRoleUpdate callback to update the role in the parent component
      onRoleUpdate(newRole);
      setModalState(false); // Close the modal

      setSuccess("User updated successfully!");
    } catch (error) {
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
          <h2>Become Creator</h2>
        </div>
        <form className="reg-form" onSubmit={handleBecomeCreator}>
          <input
            className="reg-input"
            placeholder="First Name"
            name="firstname"
            onChange={updateHandler}
            maxLength={20}
            required
          />
          <input
            className="reg-input"
            placeholder="Last Name"
            name="lastname"
            onChange={updateHandler}
            maxLength={20}
            required
          />
          <button className="submit-button" type="submit">
            Submit
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
}
