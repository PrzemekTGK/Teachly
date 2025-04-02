import { updateUser } from "../api";
import { useState } from "react";
import axios from "axios";

export default function ChangePasswordModal({ modalState, setModalState }) {
  const [userState, setUserState] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateHandler(e) {
    setUserState({ ...userState, [e.target.name]: e.target.value });
  }

  function changePassword() {}

  return (
    <>
      <div className="register-body">
        <div>
          <form className="reg-form" onSubmit={changePassword}>
            <input
              type="password"
              className="reg-input"
              placeholder="CurrentPassword"
              name="password"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            <input
              type="password"
              className="reg-input"
              placeholder="New Password"
              name="password"
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
              Register
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    </>
  );
}
