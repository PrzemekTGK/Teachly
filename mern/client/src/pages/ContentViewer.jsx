// Import routing hooks for navigation and accessing route state
import { useLocation, useNavigate } from "react-router-dom";

// Define ContentViewer component
export default function ContentViewer() {
  // Get state object passed via Link navigation
  const { state } = useLocation();
  const { videoUrl, videoTitle, videoDescription, videoUploader, uploadedAt } =
    state || {};

  // Initialize navigation function
  const navigate = useNavigate();

  // Log the received state for debugging
  console.log("ContentViewer state:", state);
  console.log("Video URL: ", videoUrl);

  // Handle missing video URL
  if (!videoUrl) {
    console.warn("No videoUrl found in state!");
    return <div>No video found!</div>;
  }

  // Format upload date
  let uploadDate = "Unknown date";
  try {
    uploadDate = new Date(uploadedAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    console.log("Formatted upload date:", uploadDate);
  } catch (error) {
    console.error("Error formatting upload date:", error);
  }

  return (
    // Render main content viewer page
    <div className="content-viewer-page">
      {/* Container for content and navigation */}
      <div className="content-container">
        {/* Navigation bar with back button and title */}
        <div className="content-nav">
          <button
            className="back-button"
            onClick={() => {
              console.log("Back button clicked");
              navigate(-1); // Navigate to previous page
            }}
          >
            {"Back"}
          </button>
          {/* Display video title or default title */}
          <h2 className="content-title">{videoTitle || "Content Viewer"}</h2>
        </div>

        {/* Video and metadata display */}
        <div className="content-video">
          {/* Video player */}
          <video controls width="640" height="360">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Display uploader name and upload date */}
          <div className="content-uploader">
            <h3>{`Uploaded by: ${videoUploader}`}</h3>
            <p className="content-upload-date">{`Upload date: ${uploadDate}`}</p>
          </div>

          {/* Display video description */}
          <div className="content-description">
            <textarea
              readOnly
              value={videoDescription || "No description available."}
              className="description-textarea"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
