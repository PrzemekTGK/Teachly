import { useState } from "react";
import ContentBrowser from "./ContentBrowser";
import StreamBrowser from "./StreamBrowser";
import Feed from "./Feed";

export default function Home() {
  const [activeTab, setActiveTab] = useState("page1");

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
        <button
          className={`tab ${activeTab === "page2" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("page2")}
        >
          Feed
        </button>
      </div>
      <div className="tab-scroll">
        <div className="tab-content">
          {activeTab === "page1" && <ContentBrowser />}
          {activeTab === "page2" && <StreamBrowser />}
          {activeTab === "page2" && <Feed />}
        </div>
      </div>
    </div>
  );
}
