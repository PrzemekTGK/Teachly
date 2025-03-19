import { useEffect, useState } from "react";
import { getVideos } from "../api";
import { Link } from "react-router-dom";

export function ContentBrowser() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const videosData = await getVideos();
        console.log(videosData);
        setVideos(videosData);
      } catch (err) {
        setError(`Error fetching videos: `, err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  if (loading) {
    return <div>Loading videos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="content-browser">
      <h2 className="content-browser-title">Content Browser</h2>
      <div className="video-grid">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video._id} className="video-item">
              <Link
                to={`/ContentViewer/${video._id}`}
                state={{
                  videoUrl: video.url,
                  videoTitle: video.title,
                  videoDescription: video.description,
                  videoUploader: video.uploader,
                }}
                className="video-title"
              >
                {video.title}
              </Link>
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
