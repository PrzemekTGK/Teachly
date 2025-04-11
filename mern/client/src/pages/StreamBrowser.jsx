import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStreams } from "../api";
import Hls from "hls.js";

export default function StreamBrowser() {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const data = await getStreams();
        setStreams(data);
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
                {stream.streamtitle}
              </Link>
              <video controls width="320" height="180">
                <source ref={stream.streamRef} type="video/mp4" />
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
