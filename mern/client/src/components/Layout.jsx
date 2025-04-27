// Import routing utilities from react-router-dom
import { Outlet, useNavigate, useLocation } from "react-router-dom";
// Import useEffect hook for handling side effects
import { useEffect } from "react";
// Import Navbar component for navigation bar
import Navbar from "./Navbar";

// Define Layout component for application structure
export default function Layout() {
  // Retrieve user token from session storage
  const user = sessionStorage.getItem("User");
  // Initialize navigation function
  const navigate = useNavigate();
  // Get current location details
  const location = useLocation();

  // Effect to handle authentication-based navigation
  useEffect(() => {
    // Define public paths accessible without authentication
    const publicPaths = [
      "/",
      "/streamBrowser",
      "/streamViewer",
      "/contentBrowser",
      "/contentViewer",
    ];
    // Check if current path is public
    const isPublicPath = publicPaths.some((path) =>
      location.pathname.startsWith(path)
    );

    // Redirect to home if user is not authenticated and path is not public
    if (!user && !isPublicPath) {
      navigate("/", { replace: true });
    }
  }, [user, navigate, location]); // Dependencies for effect

  return (
    <>
      {/* Render navigation bar */}
      <Navbar />
      {/* Render main content area with child routes */}
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
