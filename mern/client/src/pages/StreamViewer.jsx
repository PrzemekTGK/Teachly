import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Hls from "hls.js";
export default function StreamViewer() {
  const { state } = useLocation();
  const streamRef = useRef(null);
  const { streamId, streamerId, streamUrl, streamtitle, streamdescription } =
    state;

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
      <h2>{streamtitle || "Stream Viewer"}</h2>
      <div className="stream-viewer">
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
      <p>{streamdescription || "No description available"}</p>
      <p>Stream ID: {streamId}</p>
      <p>Streamer ID: {streamerId}</p>
    </div>
  );
}
