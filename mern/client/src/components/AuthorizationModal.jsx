// Import useState hook from React for managing component state
import { useState } from "react";
// Import Login and Register components for modal content
import Login from "./Login";
import Register from "./Register";

// Define AuthorizationModal component, receiving modalState and setModalState as props
export default function AuthorizationModal({ modalState, setModalState }) {
  // Initialize state to toggle between login and register views, defaulting to login
  const [login, setLogin] = useState(true);

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
        {/* Render modal navigation bar for switching between login and register */}
        <div className="modal-bar">
          {/* Button to show login form */}
          <button
            onClick={() => {
              if (!login) {
                setLogin(!login);
              }
            }}
          >
            Login
          </button>
          {/* Button to show register form */}
          <button
            onClick={() => {
              if (login) {
                setLogin(!login);
              }
            }}
          >
            Register
          </button>
        </div>
        {/* Conditionally render Login or Register component based on login state */}
        {login ? (
          <Login modalState={setModalState} setModalState={setModalState} />
        ) : (
          <Register modalState={setModalState} setModalState={setModalState} />
        )}
      </div>
    </div>
  );
}
