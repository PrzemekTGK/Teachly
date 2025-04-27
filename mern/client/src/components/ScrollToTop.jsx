// Import React hook for handling side effects
import { useEffect } from "react";
// Import routing hook to access current location
import { useLocation } from "react-router-dom";

// Define ScrollToTop component
export default function ScrollToTop() {
  // Get current location object
  const location = useLocation();

  // Effect to scroll window to top on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // This component does not render anything
  return null;
}
