import { createUser, validatePassword } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register({ modalState, setModalState }) {
  const [user, setUser] = useState({
    imageId: "",
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function updateHandler(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  async function registerNewUser(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!validateEmail(user.email)) {
      setError("Enter a Valid Email!!");
      return;
    }

    if (!validatePassword(user.password)) {
      setError(
        "Password must be at least 8 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    try {
      const { confirmPassword, ...user } = user;
      let newUser = await createUser(user);

      if (newUser.data.success) {
        setSuccess("User created successfully!");
        setModalState(!modalState);
        sessionStorage.setItem("User", newUser.data.token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newUser.token}`;
        navigate("../profile");
      } else {
        setError(newUser.data.message); // Display error message from backend
      }
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
    <>
      <div className="register-body">
        <div>
          <form className="reg-form" onSubmit={registerNewUser}>
            <input
              className="reg-input"
              placeholder="User Name"
              name="username"
              onChange={updateHandler}
              maxLength={20}
              required
            />
            <input
              className="reg-input"
              placeholder="E-mail"
              name="email"
              onChange={updateHandler}
              maxLength={40}
              required
            />
            <input
              type="password"
              className="reg-input"
              placeholder="Password"
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
            <button className="submit-button register-button" type="submit">
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
