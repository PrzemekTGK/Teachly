import { useEffect, useState } from "react";
import { getStreams } from "../api";
import { Link } from "react-router-dom";

export default function ContentBrowser() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const streamsData = await getStreams();
        setStreams(streamsData);
        console.log(`streams `, streams);
      } catch (err) {
        setError(`Error fetching videos: `, err);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  if (loading) {
    return <div>Loading live streams...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="content-browser">
      <h2 className="content-browser-title">Stream Browser</h2>
      <div className="video-grid">
        {streams.length > 0 ? (
          streams.map((stream) => (
            <div key={stream._id} className="video-item">
              <Link
                to={`/ContentViewer/${stream._id}`}
                state={{
                  streamId: stream._id,
                  streamerId: stream.streamerId,
                  streamUrl: stream.streamUrl,
                  streamtitle: stream.streamtitle,
                  streamdescription: stream.streamdescription,
                }}
                className="video-title"
              >
                {stream.title}
              </Link>
              <video controls width="320" height="180">
                <source src={stream.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))
        ) : (
          <p>No streams available.</p>
        )}
      </div>
    </div>
  );
}
