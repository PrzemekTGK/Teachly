import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Hls from "hls.js";
import { getStream } from "../api";

export default function StreamViewer() {
  const { state } = useLocation();
  const { id } = useParams();
  const streamRef = useRef(null);
  const [streamData, setStreamData] = useState(state || {});
  const [error, setError] = useState(null);
  const { streamUrl, streamtitle, streamdescription, streamerId } = streamData;

  useEffect(() => {
    if (!state || !state.streamUrl) {
      const fetchStreamData = async () => {
        try {
          const response = await getStream(id);
          console.log("Fetched stream data:", response);
          if (response.success && response.data) {
            setStreamData({
              streamId: response.data._id,
              streamerId: response.data.streamerId,
              streamUrl: response.data.streamUrl,
              streamtitle: response.data.streamtitle,
              streamdescription: response.data.streamdescription,
              streamKey: response.data.streamKey,
            });
          } else {
            setError("Stream not found");
          }
        } catch (error) {
          console.error("Error fetching stream:", error);
          setError("Failed to load stream");
        }
      };
      fetchStreamData();
    }
  }, [id, state]);

  useEffect(() => {
    if (streamUrl && streamRef.current) {
      console.log("Attempting to load streamUrl:", streamUrl);
      if (Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(streamRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed, playing");
          streamRef.current.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data.type, data.details, data);
          setError(`Stream error: ${data.type}`);
        });
      } else if (
        streamRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        streamRef.current.src = streamUrl;
        streamRef.current.addEventListener("loadedmetadata", () => {
          console.log("Native HLS loaded, playing");
          streamRef.current.play();
        });
      }
    }
  }, [streamUrl]);

  return (
    <div className="stream-viewer-container">
      <div className="stream-viewer">
        {error ? (
          <p>{error}</p>
        ) : streamUrl ? (
          <video
            ref={streamRef}
            controls
            autoPlay
            width="640"
            height="360"
            crossOrigin="anonymous"
            className="stream-viewer-video"
          />
        ) : (
          <p>Loading stream...</p>
        )}
      </div>
      <h2>{streamtitle}</h2>
      <p>{streamdescription}</p>
    </div>
  );
}
