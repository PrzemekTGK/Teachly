import { useState, useEffect } from "react";
import { testBackend } from "../api";
import ContentBrowser from "./ContentBrowser";
import StreamBrowser from "./StreamBrowser";

export default function Home() {
  const [activeTab, setActiveTab] = useState("page1");
  useEffect(() => {
    testBackend()
      .then((data) => console.log("Home data:", data))
      .catch((err) => console.error("Home error:", err));
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
      </div>
      <div className="tab-scroll">
        <div className="tab-content">
          {activeTab === "page1" && <ContentBrowser />}
          {activeTab === "page2" && <StreamBrowser />}
        </div>
      </div>
    </div>
  );
}
