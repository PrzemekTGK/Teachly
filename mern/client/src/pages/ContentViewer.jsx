import { useLocation, useNavigate } from "react-router-dom";

export function ContentViewer() {
  const { state } = useLocation();
  const { videoUrl, videoTitle, videoDescription, videoUploader } = state || {};
  const navigate = useNavigate();

  if (!videoUrl) {
    return <div>No video found!</div>;
  }

  return (
    <div className="content-viewer-page">
      <div className="content-container">
        <div className="content-nav">
          <button className="back-button" onClick={() => navigate(-1)}>
            {"< Back"}
          </button>
          <h2 className="content-title">{videoTitle || "Content Viewer"}</h2>
          <h3>{`By: ${videoUploader}`}</h3>
        </div>
        <div className="content-video">
          <video controls width="640" height="360">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
