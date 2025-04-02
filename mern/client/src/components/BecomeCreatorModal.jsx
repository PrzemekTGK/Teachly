import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { updateUser } from "../api";
import axios from "axios";
export default function BecomeCreatorModal({
  modalState,
  setModalState,
  onRoleUpdate,
}) {
  const [userState, setUserState] = useState({
    firstname: "",
    lastname: "",
    role: "creator",
  });
  const [error, setError] = useState(""); // For error messages
  const [success, setSuccess] = useState(""); // For success messages

  function updateHandler(e) {
    setUserState({ ...userState, [e.target.name]: e.target.value });
  }

  async function handleBecomeCreator(e) {
    e.preventDefault(); // Prevent default form submission behavior

    // Reset success and error messages on each submission attempt
    setError("");
    setSuccess("");
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const userId = decodedUser._id;
    const newRole = userState.role;

    try {
      const updatedUser = {
        firstname: userState.firstname,
        lastname: userState.lastname,
        role: newRole,
      };
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await updateUser(userId, updatedUser);

      // Use the token returned by the backend; no need to encode manually
      const newToken = response.data.token;
      sessionStorage.setItem("User", newToken);

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
