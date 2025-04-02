import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation(); // Get current location

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page whenever the route changes
  }, [location]);

  return null; // This component doesn't render anything
}
