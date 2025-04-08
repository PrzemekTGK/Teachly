import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
export default function AuthorizationModal({ modalState, setModalState }) {
  const [login, setLogin] = new useState(true);

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
          <button
            onClick={() => {
              if (!login) {
                setLogin(!login);
              }
            }}
          >
            Login
          </button>
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
        {login ? (
          <Login modalState={setModalState} setModalState={setModalState} />
        ) : (
          <Register modalState={setModalState} setModalState={setModalState} />
        )}
      </div>
    </div>
  );
}
