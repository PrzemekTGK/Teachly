import { useLocation, useNavigate } from "react-router-dom";

export default function ContentViewer() {
  const { state } = useLocation();
  const { videoUrl, videoTitle, videoDescription, videoUploader, uploadedAt } =
    state || {};
  const navigate = useNavigate();

  console.log("ContentViewer state:", state);

  if (!videoUrl) {
    console.warn("No videoUrl found in state!");
    return <div>No video found!</div>;
  }

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
    <div className="content-viewer-page">
      <div className="content-container">
        <div className="content-nav">
          <button
            className="back-button"
            onClick={() => {
              console.log("Back button clicked");
              navigate(-1);
            }}
          >
            {"Back"}
          </button>
          <h2 className="content-title">{videoTitle || "Content Viewer"}</h2>
        </div>
        <div className="content-video">
          <video controls width="640" height="360">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="content-uploader">
            <h3>{`Uploaded by: ${videoUploader}`}</h3>
            <p className="content-upload-date">{`Upload date: ${uploadDate}`}</p>
          </div>
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
