// Import React hooks for state and side effects
import { useEffect, useState } from "react";
// Import API function to fetch videos
import { getVideos } from "../api";
// Import Link component for client-side navigation
import { Link } from "react-router-dom";

// Define ContentBrowser component
export default function ContentBrowser() {
  // State for storing fetched videos
  const [videos, setVideos] = useState([]);
  // State for managing loading status
  const [loading, setLoading] = useState(true);
  // State for managing error messages
  const [error, setError] = useState(null);

  // Effect to fetch videos when component mounts
  useEffect(() => {
    async function fetchVideos() {
      console.log("Starting to fetch videos...");
      try {
        // Fetch videos from API
        const videosData = await getVideos();
        console.log("Videos fetched successfully:", videosData);
        setVideos(videosData);
      } catch (err) {
        // Handle errors during fetch
        console.error("Error fetching videos:", err);
        setError(`Error fetching videos: ${err.message || err}`);
      } finally {
        console.log("Finished fetching videos.");
        setLoading(false); // Set loading to false after request completes
      }
    }

    fetchVideos();
  }, []);

  // Render loading state
  if (loading) {
    console.log("Currently loading videos...");
    return <div>Loading videos...</div>;
  }

  // Render error state
  if (error) {
    console.error("Rendering error:", error);
    return <div>{error}</div>;
  }

  return (
    // Render content browser container
    <div className="content-browser">
      {/* Content browser title */}
      <h2 className="content-browser-title">Content Browser</h2>

      {/* Video grid layout */}
      <div className="video-grid">
        {/* Check if there are videos to display */}
        {videos.length > 0 ? (
          videos.map((video) => (
            // Render each video item
            <div key={video._id} className="video-item">
              {/* Link to content viewer page with video data passed via state */}
              <Link
                to={`/ContentViewer/${video._id}`}
                state={{
                  videoUrl: video.url,
                  videoTitle: video.title,
                  videoDescription: video.description,
                  videoUploader: video.uploader,
                  uploadedAt: video.uploadedAt,
                }}
                className="video-title"
              >
                {video.title}
              </Link>

              {/* Render video player */}
              <video controls width="320" height="180">
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))
        ) : (
          // Display message if no videos are available
          <p>No videos available.</p>
        )}
      </div>
    </div>
  );
}
