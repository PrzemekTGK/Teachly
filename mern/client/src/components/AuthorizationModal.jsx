import React, { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";
function AuthorizationModal({ modalState, setModalState }) {
  const [loginState, setLogin] = new useState(true);

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
              if (!loginState) {
                setLogin(!loginState);
              }
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              if (loginState) {
                setLogin(!loginState);
              }
            }}
          >
            Register
          </button>
        </div>
        {loginState ? (
          <Login modalState={setModalState} setModalState={setModalState} />
        ) : (
          <Register modalState={setModalState} setModalState={setModalState} />
        )}
      </div>
    </div>
  );
}

export default AuthorizationModal;
