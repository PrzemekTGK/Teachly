import { useEffect, useState, useRef } from "react";
import { getStreams } from "../api";
import { Link } from "react-router-dom";
import Hls from "hls.js";

export default function StreamBrowser() {
  const [streamUrl, setStreamUrl] = useState("");
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStreams() {
      try {
        const streamsData = await getStreams();
        setStreams(streamsData.data);
        console.log(`Stream Data `, streamsData);
        console.log(`Streams `, streams);
      } catch (err) {
        setError(`Error fetching videos: `, err);
      } finally {
        setLoading(false);
      }
    }

    fetchStreams();
  }, []);

  useEffect(() => {
    if (!loading && streamUrl && streamRef.current && isLive) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(streamRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          streamRef.current.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data.type, data.details);
        });
      } else if (
        streamRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        streamRef.current.src = streamUrl;
        streamRef.current.addEventListener("loadedmetadata", () => {
          streamRef.current.play();
        });
      }
    }
  }, [loading, streamUrl, isLive]);

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
