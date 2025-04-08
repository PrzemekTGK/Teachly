import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AuthorizationModal from "./AuthorizationModal";
import Dropwdown from "./Dropdown";

export default function Navbar() {
  const [openModalState, setOpenModalState] = useState(false);
  const [menuOpenState, setMenuOpenState] = useState(false);
  const [userRoleState, setUserRoleState] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("User");

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRoleState(decodedToken.role);
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
        setMenuOpenState(false);
      }
    };

    if (menuOpenState) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpenState]);

  function handleLogout() {
    sessionStorage.removeItem("User");
    sessionStorage.removeItem("StreamKey");
    setMenuOpenState(false); // Close dropdown when logging out
    setTimeout(() => {
      navigate("/");
    }, 0);
  }

  function handleLinkClick() {
    setMenuOpenState(false); // Close dropdown when navigating
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
              onClick={() => setMenuOpenState((prev) => !prev)}
            >
              ☰
            </button>

            {menuOpenState && (
              <Dropwdown
                userRole={userRoleState}
                dropdownRef={dropdownRef}
                handleLinkClick={handleLinkClick}
                handleLogout={handleLogout}
              />
            )}
          </div>
        ) : (
          <div className="nav-item">
            <button onClick={() => setOpenModalState(true)}>Login</button>
          </div>
        )}
      </div>
      {openModalState && (
        <div className="modal-wrapper">
          <AuthorizationModal
            modalState={openModalState}
            setModalState={setOpenModalState}
          />
        </div>
      )}
    </div>
  );
}
