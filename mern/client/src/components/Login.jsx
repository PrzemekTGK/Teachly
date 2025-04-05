import { verifyUser } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function Login({ modalState, setModalState }) {
  const [userState, setUserState] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // For error messages
  const [success, setSuccess] = useState(""); // For success messages
  const navigate = useNavigate();

  function updateHandler(e) {
    setUserState({ ...userState, [e.target.name]: e.target.value });
  }

  async function loginHandler(e) {
    e.preventDefault(); // Display an alert if they don't match;

    // Reset success and error messages on each submission attempt
    setError("");
    setSuccess("");

    try {
      const response = await verifyUser(userState);

      if (response.success) {
        setSuccess("User logged in successfully!");
        setModalState(!modalState);
        sessionStorage.setItem("User", response.data);
        const decodedUser = jwtDecode(response.data);
        const streamKey = decodedUser.streamKey;
        console.log(streamKey);
        sessionStorage.setItem("StreamKey", streamKey);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.token}`;
        navigate("../");
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
    }
  }

  return (
    <>
      <div className="login-body">
        <div className="reg-form" onSubmit={updateHandler}>
          <form onSubmit={loginHandler}>
            <input
              className="reg-input"
              placeholder="E-mail"
              onChange={updateHandler}
              name="email"
              required
              maxLength={40}
            />
            <input
              type="password"
              className="reg-input"
              placeholder="Password"
              onChange={updateHandler}
              name="password"
              required
              maxLength={20}
            />
            <button className="submit-button" type="submit">
              Login
            </button>
          </form>
          {/* Show success or error messages */}
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    </>
  );
}
