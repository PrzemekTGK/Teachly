import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal.jsx";

export default function Dropwdown({
  userRole,
  dropdownRef,
  handleLinkClick,
  handleLogout,
}) {
  const [confirmModalState, setConfirmModalState] = useState(false);
  return (
    <div ref={dropdownRef} className="dropdown-menu">
      <Link to={"/profile"} className="navitem" onClick={handleLinkClick}>
        <button>Profile</button>
      </Link>
      {userRole === "creator" && (
        <Link
          to={"/contentUpload"}
          className="navitem"
          onClick={handleLinkClick}
        >
          <button>Upload</button>
        </Link>
      )}
      {userRole === "creator" && (
        <Link
          to={"/contentManager"}
          className="navitem"
          onClick={handleLinkClick}
        >
          <button>Content</button>
        </Link>
      )}
      {userRole === "creator" && (
        <Link
          to={"/streamManager"}
          className="navitem"
          onClick={handleLinkClick}
        >
          <button>Stream</button>
        </Link>
      )}
      <button
        onClick={() => {
          setConfirmModalState(!confirmModalState);
        }}
      >
        Logout
      </button>
      {confirmModalState && (
        <div className="modal-wrapper">
          <ConfirmationModal
            modalState={confirmModalState}
            setModalState={setConfirmModalState}
            onConfirm={() => {
              handleLogout();
            }}
          />
        </div>
      )}{" "}
    </div>
  );
}
