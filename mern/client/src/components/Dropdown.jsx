import { Link } from "react-router-dom";
export function Dropwdown({
  userRole,
  dropdownRef,
  handleLinkClick,
  handleLogout,
}) {
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

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dropwdown;
