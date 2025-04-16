import { useState, useEffect } from "react";
import ContentBrowser from "./ContentBrowser";
import StreamBrowser from "./StreamBrowser";
import Feed from "./Feed";

export default function Home() {
  const [activeTab, setActiveTab] = useState("page1");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("User"); // or "user", etc.
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="home-page">
      <div className="tab-container">
        <button
          className={`tab ${activeTab === "page1" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("page1")}
        >
          Content
        </button>
        <button
          className={`tab ${activeTab === "page2" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("page2")}
        >
          Live Streaming
        </button>
        {isLoggedIn && (
          <button
            className={`tab ${activeTab === "page3" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("page3")}
          >
            Feed
          </button>
        )}
      </div>
      <div className="tab-scroll">
        <div className="tab-content">
          {activeTab === "page1" && <ContentBrowser />}
          {activeTab === "page2" && <StreamBrowser />}
          {activeTab === "page3" && <Feed />}
        </div>
      </div>
    </div>
  );
}
