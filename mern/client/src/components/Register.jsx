import { createUser } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Register({ modalState, setModalState }) {
  const [userState, setUserState] = useState({
    imageId: "",
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });

  const [error, setError] = useState(""); // For error messages
  const [success, setSuccess] = useState(""); // For success messages
  const navigate = useNavigate();

  function updateHandler(e) {
    setUserState({ ...userState, [e.target.name]: e.target.value });
  }

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email); // Returns true if valid email format, false otherwise
  };

  async function registerNewUser(e) {
    e.preventDefault(); // Display an alert if they don't match;

    // Reset success andtoke error messages on each submission attempt
    setError("");
    setSuccess("");

    // Check if password and confirmPassword match
    if (userState.password !== userState.confirmPassword) {
      setError("Passwords do not match!");
      return; // Stop the submission
    }
    if (!validateEmail(userState.email)) {
      setError("Enter a Valid Email!!");
      return; // Don't submit the form and prevent modal from closing
    }

    try {
      const { userConfirmedPassword, ...user } = userState;
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
              onChange={updateHandler}
              name="username"
              required
              maxLength={20}
            />
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
            <input
              type="password"
              className="reg-input"
              placeholder="Confirm Password"
              onChange={updateHandler}
              name="confirmPassword"
              required
              maxLength={20}
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
