import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStreams } from "../api";

export default function StreamBrowser() {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await getStreams();
        setStreams(response.data);
      } catch (err) {
        console.error("Failed to load live streams:", err);
      }
    };
    fetchStreams();
  }, []);

  return (
    <div className="content-browser">
      <h2 className="content-browser-title">Stream Browser</h2>
      <div className="video-grid">
        {streams.length > 0 ? (
          streams.map((stream) => (
            <div key={stream._id} className="video-item">
              <Link
                to={`/streamViewer/${stream._id}`}
                state={{
                  streamId: stream._id,
                  streamerId: stream.streamerId,
                  streamUrl: stream.streamUrl,
                  streamtitle: stream.streamtitle,
                  streamdescription: stream.streamdescription,
                }}
                className="video-title"
              >
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.streamtitle}
                  width="320"
                  height="180"
                />
                {stream.streamtitle}
              </Link>
            </div>
          ))
        ) : (
          <p>No streams available.</p>
        )}
      </div>
    </div>
  );
}
