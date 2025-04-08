import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AuthorizationModal from "./AuthorizationModal";
import Dropwdown from "./Dropdown";

export default function Navbar() {
  const [openModal, setOpenModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("User");

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, [token]);

  useEffect(() => {
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

    if (menuOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  function handleLogout() {
    sessionStorage.removeItem("User");
    sessionStorage.removeItem("StreamKey");
    setMenuOpen(false); // Close dropdown when logging out
    setTimeout(() => {
      navigate("/");
    }, 0);
  }

  function handleLinkClick() {
    setMenuOpen(false); // Close dropdown when navigating
  }

  return (
    <div className="navbar-container">
      <div className="navbar">
        <Link to={"/"} className="navitem">
          <button>Home</button>
        </Link>

        {token ? (
          <div className="burger-container">
            <button
              ref={buttonRef}
              className="burger-menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              ☰
            </button>

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
          <div className="nav-item">
            <button onClick={() => setOpenModal(true)}>Login</button>
          </div>
        )}
      </div>
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
