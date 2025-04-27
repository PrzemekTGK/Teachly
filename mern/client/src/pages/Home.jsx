// Import React hooks for state and side effects
import { useState, useEffect } from "react";
// Import components for each tab
import ContentBrowser from "./ContentBrowser";
import StreamBrowser from "./StreamBrowser";
import Feed from "./Feed";

// Define Home component
export default function Home() {
  // State for tracking which tab is active
  const [activeTab, setActiveTab] = useState("page1");
  // State to check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Effect to check login status on component mount
  useEffect(() => {
    const token = sessionStorage.getItem("User"); // Retrieve token from session storage
    setIsLoggedIn(!!token); // Set login status based on token presence
  }, []);

  return (
    // Render home page container
    <div className="home-page">
      {/* Render tab navigation buttons */}
      <div className="tab-container">
        {/* Content tab button */}
        <button
          className={`tab ${activeTab === "page1" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("page1")}
        >
          Content
        </button>

        {/* Live Streaming tab button */}
        <button
          className={`tab ${activeTab === "page2" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("page2")}
        >
          Live Streaming
        </button>

        {/* Feed tab button (only visible when logged in) */}
        {isLoggedIn && (
          <button
            className={`tab ${activeTab === "page3" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("page3")}
          >
            Feed
          </button>
        )}
      </div>

      {/* Render scrollable area for tab content */}
      <div className="tab-scroll">
        <div className="tab-content">
          {/* Conditionally render tab content based on active tab */}
          {activeTab === "page1" && <ContentBrowser />}
          {activeTab === "page2" && <StreamBrowser />}
          {activeTab === "page3" && <Feed />}
        </div>
      </div>
    </div>
  );
}
