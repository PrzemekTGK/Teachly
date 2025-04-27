// Import useState hook for managing component state
import { useState } from "react";
// Import Link component for navigation
import { Link } from "react-router-dom";
// Import ConfirmationModal component for logout confirmation
import ConfirmationModal from "../components/ConfirmationModal.jsx";

// Define Dropdown component with userRole, dropdownRef, handleLinkClick, and handleLogout props
export default function Dropwdown({
  userRole,
  dropdownRef,
  handleLinkClick,
  handleLogout,
}) {
  // Initialize state for controlling confirmation modal visibility
  const [confirmModal, setConfirmModal] = useState(false);

  return (
    // Render dropdown menu with reference for click handling
    <div ref={dropdownRef} className="dropdown-menu">
      {/* Link to profile page */}
      <Link to={"/profile"} className="navitem" onClick={handleLinkClick}>
        <button>Profile</button>
      </Link>
      {/* Conditionally render Upload link for creators */}
      {userRole === "creator" && (
        <Link
          to={"/contentUpload"}
          className="navitem"
          onClick={handleLinkClick}
        >
          <button>Upload</button>
        </Link>
      )}
      {/* Conditionally render Content link for creators */}
      {userRole === "creator" && (
        <Link
          to={"/contentManager"}
          className="navitem"
          onClick={handleLinkClick}
        >
          <button>Content</button>
        </Link>
      )}
      {/* Conditionally render Stream link for creators */}
      {userRole === "creator" && (
        <Link
          to={"/streamManager"}
          className="navitem"
          onClick={handleLinkClick}
        >
          <button>Stream</button>
        </Link>
      )}
      {/* Button to trigger logout confirmation modal */}
      <button
        onClick={() => {
          setConfirmModal(!confirmModal);
        }}
      >
        Logout
      </button>
      {/* Conditionally render confirmation modal for logout */}
      {confirmModal && (
        <div className="modal-wrapper">
          <ConfirmationModal
            modalState={confirmModal}
            setModalState={setConfirmModal}
            onConfirm={() => {
              handleLogout();
            }}
          />
        </div>
      )}
    </div>
  );
}
