import { useEffect, useState } from "react";
import { getVideos, deleteVideo } from "../api";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ContentManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const videosData = await getVideos();
        setVideos(videosData);
      } catch (err) {
        setError(`Error fetching videos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const token = sessionStorage.getItem("User");
  let userId = null;
  if (token) {
    const decodedUser = jwtDecode(token);
    userId = decodedUser._id;
  }

  const userVideos = videos.filter((video) => video.uploaderId === userId);

  async function handleDelete(videoId) {
    try {
      const response = await deleteVideo(videoId);
      if (response && response.status === 200) {
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video._id !== videoId)
        );
      }
    } catch (error) {
      setError("Error deleting video:", error);
    }
  }

  if (loading) {
    return <div>Loading videos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="content-manager">
      <h2 className="content-manager-title">Content Manager</h2>
      <div className="video-grid">
        {userVideos.length > 0 ? (
          userVideos.map((video) => (
            <div key={video._id} className="video-item">
              <div className="video-delete-bar">
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
                <button
                  className="delete-video-button"
                  onClick={() => handleDelete(video._id)}
                >
                  Delete X
                </button>
              </div>
              <video controls width="320" height="180">
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))
        ) : (
          <p>No videos available.</p>
        )}
      </div>
    </div>
  );
}
