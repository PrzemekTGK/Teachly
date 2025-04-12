import { useState, useEffect, useRef, useParams } from "react";
import { useLocation } from "react-router-dom";
import { getStream } from "../api";
import Hls from "hls.js";
export default function StreamViewer() {
  const { state } = useLocation();
  const { id } = useParams();
  const streamRef = useRef(null);
  const [streamData, setStreamData] = useState(state || {});
  const { streamUrl, streamtitle, streamdescription, streamerId } = streamData;
  useEffect(() => {
    if (!state || !state.streamUrl) {
      const fetchStreamData = async () => {
        try {
          const response = await getStream(id);
          if (response.success && response.data) {
            setStreamData({
              streamId: response.data._id,
              streamerId: response.data.streamerId,
              streamUrl: response.data.streamUrl,
              streamtitle: response.data.streamtitle,
              streamdescription: response.data.streamdescription,
            });
          }
        } catch (error) {
          console.error("Error fetching stream:", error);
        }
      };
      fetchStreamData();
    }
  }, [id, state]);

  useEffect(() => {
    if (streamUrl && streamRef.current) {
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
  }, [streamUrl]);

  return (
    <div className="stream-viewer-container">
      <div className="stream-viewer">
        <h2>{"Stream Viewer"}</h2>
        <video
          ref={streamRef}
          controls
          autoPlay
          width="640"
          height="360"
          crossOrigin="anonymous"
          className="stream-viewer-video"
        />
      </div>
      <h2>{streamtitle}</h2>
      <p>{streamdescription || "No description available"}</p>
    </div>
  );
}
