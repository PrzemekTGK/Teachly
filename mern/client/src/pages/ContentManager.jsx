// Import React hooks for state and side effects
import { useEffect, useState } from "react";
// Import API functions to fetch and delete videos
import { getVideos, deleteVideo } from "../api";
// Import Link component for client-side navigation
import { Link } from "react-router-dom";
// Import jwtDecode to decode JWT tokens
import { jwtDecode } from "jwt-decode";
// Import custom confirmation modal component
import ConfirmationModal from "../components/ConfirmationModal";

// Define ContentManager component
export default function ContentManager() {
  // State for storing fetched videos
  const [videos, setVideos] = useState([]);
  // State for managing loading status
  const [loading, setLoading] = useState(true);
  // State for managing error messages
  const [error, setError] = useState(null);
  // State for controlling confirmation modal visibility
  const [confirmModal, setConfirmModal] = useState(false);
  // State for tracking the video ID to be deleted
  const [videoId, setVideoId] = useState("");

  // Effect to fetch videos when component mounts
  useEffect(() => {
    async function fetchVideos() {
      try {
        // Fetch videos from API
        const videosData = await getVideos();
        setVideos(videosData);
      } catch (err) {
        // Handle fetch errors
        setError(`Error fetching videos: ${err.message}`);
      } finally {
        setLoading(false); // End loading state
      }
    }
    fetchVideos();
  }, []);

  // Retrieve JWT token from session storage
  const token = sessionStorage.getItem("User");

  // Decode token to extract user ID
  let userId = null;
  if (token) {
    const decodedUser = jwtDecode(token);
    userId = decodedUser._id;
  }

  // Filter videos uploaded by the current user
  const userVideos = videos.filter((video) => video.uploaderId === userId);

  // Handle deletion of a video
  async function handleDelete(videoId) {
    try {
      // Call API to delete video
      const response = await deleteVideo(videoId);
      if (response && response.status === 200) {
        // Remove deleted video from state
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video._id !== videoId)
        );
      }
    } catch (error) {
      // Handle delete errors
      setError("Error deleting video:", error);
    }
  }

  // Render loading state
  if (loading) {
    return <div>Loading videos...</div>;
  }

  // Render error state
  if (error) {
    return <div>{error}</div>;
  }

  return (
    // Render scrollable container
    <div className="scroll">
      {/* Render content manager container */}
      <div className="content-manager">
        {/* Content manager title */}
        <h2 className="content-manager-title">Content Manager</h2>

        {/* Video grid layout */}
        <div className="video-grid">
          {/* Check if there are user videos to display */}
          {userVideos.length > 0 ? (
            userVideos.map((video) => (
              // Render each video item
              <div key={video._id} className="video-item">
                {/* Render title and delete button */}
                <div className="video-delete-bar">
                  {/* Link to view video details */}
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

                  {/* Delete video button */}
                  <button
                    className="delete-video-button"
                    onClick={() => {
                      setConfirmModal(!confirmModal); // Open confirmation modal
                      setVideoId(video._id); // Set ID of video to delete
                    }}
                  >
                    X
                  </button>
                </div>

                {/* Render video player */}
                <video controls width="320" height="180">
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))
          ) : (
            // Display message if no user videos are available
            <p>No videos available.</p>
          )}
        </div>
      </div>

      {/* Render confirmation modal if open */}
      {confirmModal && (
        <div className="modal-wrapper">
          <ConfirmationModal
            modalState={confirmModal}
            setModalState={setConfirmModal}
            onConfirm={() => {
              handleDelete(videoId); // Call delete function on confirm
            }}
          />
        </div>
      )}
    </div>
  );
}
