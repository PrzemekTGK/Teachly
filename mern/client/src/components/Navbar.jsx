// Import React hooks for state, effects, and refs
import { useState, useEffect, useRef } from "react";
// Import routing components for navigation
import { useNavigate, Link } from "react-router-dom";
// Import jwtDecode for decoding JWT tokens
import { jwtDecode } from "jwt-decode";
// Import modal and dropdown components
import AuthorizationModal from "./AuthorizationModal";
import Dropwdown from "./Dropdown";

// Define Navbar component
export default function Navbar() {
  // State for controlling authorization modal visibility
  const [openModal, setOpenModal] = useState(false);
  // State for controlling dropdown menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  // State for storing user role
  const [userRole, setUserRole] = useState(null);
  // Ref for dropdown menu to handle click outside
  const dropdownRef = useRef(null);
  // Ref for burger menu button
  const buttonRef = useRef(null);
  // Initialize navigation function
  const navigate = useNavigate();

  // Retrieve JWT token from session storage
  const token = sessionStorage.getItem("User");

  // Effect to decode token and set user role
  useEffect(() => {
    if (token) {
      // Decode token to extract role
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, [token]);

  // Effect to handle clicks outside dropdown menu
  useEffect(() => {
    // Handler to close dropdown if click is outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (menuOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    } else {
      // Remove event listener when dropdown is closed
      document.removeEventListener("click", handleClickOutside);
    }

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  // Handle user logout
  function handleLogout() {
    // Remove user token and stream key from session storage
    sessionStorage.removeItem("User");
    sessionStorage.removeItem("StreamKey");
    // Close dropdown menu
    setMenuOpen(false);
    // Navigate to home and refresh page
    setTimeout(() => {
      navigate("/", { replace: true });
      navigate(0);
    }, 0);
  }

  // Close dropdown when a link is clicked
  function handleLinkClick() {
    setMenuOpen(false);
  }

  return (
    // Render navbar container
    <div className="navbar-container">
      {/* Render navbar */}
      <div className="navbar">
        {/* Link to home page */}
        <Link to={"/"} className="navitem">
          <button>Home</button>
        </Link>
        {/* Conditionally render based on user authentication */}
        {token ? (
          // Render burger menu for authenticated users
          <div className="burger-container">
            {/* Button to toggle dropdown menu */}
            <button
              ref={buttonRef}
              className="burger-menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              ☰
            </button>
            {/* Render dropdown menu when open */}
            {menuOpen && (
              <Dropwdown
                userRole={userRole}
                dropdownRef={dropdownRef}
                handleLinkClick={handleLinkClick}
                handleLogout={handleLogout}
              />
            )}
          </div>
        ) : (
          // Render login button for unauthenticated users
          <div className="nav-item">
            <button onClick={() => setOpenModal(true)}>Login</button>
          </div>
        )}
      </div>
      {/* Render authorization modal when open */}
      {openModal && (
        <div className="modal-wrapper">
          <AuthorizationModal
            modalState={openModal}
            setModalState={setOpenModal}
          />
        </div>
      )}
    </div>
  );
}
