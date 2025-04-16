import { verifyUser } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function Login({ modalState, setModalState }) {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function updateHandler(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  async function loginHandler(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await verifyUser(user);

      if (response.success) {
        setSuccess("User logged in successfully!");
        setModalState(!modalState);
        sessionStorage.setItem("User", response.data);
        const decodedUser = jwtDecode(response.data);
        const streamKey = decodedUser.streamKey;
        sessionStorage.setItem("StreamKey", streamKey);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.token}`;
        navigate("/", { replace: true });
        navigate(0);
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
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      </div>
    </>
  );
}
