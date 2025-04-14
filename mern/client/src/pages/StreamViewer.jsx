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
  const [isLoading, setIsLoading] = useState(!state || !state.streamUrl);
  const { streamUrl, streamtitle, streamdescription, streamerId } = streamData;

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

    if (!state || !state.streamUrl) {
      fetchStreamData();
    }
  }, [id, state]);

  useEffect(() => {
    const videoElement = streamRef.current;

    if (streamUrl && videoElement && !error) {
      console.log("Loading streamUrl:", streamUrl);
      fetch(streamUrl, { method: "HEAD" })
        .then((res) => {
          if (res.ok) {
            loadStream(videoElement);
          } else {
            console.log("StreamUrl inaccessible, retrying fetch");
            getStream(id).then((response) => {
              if (response.success && response.data) {
                setStreamData((prev) => ({
                  ...prev,
                  streamUrl: response.data.streamUrl,
                  streamKey: response.data.streamKey,
                }));
              } else {
                setError("Stream unavailable");
              }
            });
          }
        })
        .catch((err) => {
          console.error("StreamUrl check failed:", err);
          setError("Stream unavailable");
        });
    }

    function loadStream(videoElement) {
      if (!videoElement) {
        console.log("No video element, aborting load");
        setError("Video element not found");
        return;
      }
      if (Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed");
          if (videoElement) {
            videoElement.play().catch((err) => {
              console.error("Play failed:", err);
              setError("Failed to play stream");
            });
          }
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data.type, data.details, data);
          setError(`Stream error: ${data.type}`);
        });
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = streamUrl;
        videoElement.addEventListener("loadedmetadata", () => {
          console.log("Native HLS loaded");
          if (videoElement) {
            videoElement.play().catch((err) => {
              console.error("Play failed:", err);
              setError("Failed to play stream");
            });
          }
        });
      }
    }

    return () => {
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, [streamUrl, id, error]);

  return (
    <div className="stream-viewer-container">
      <div className="stream-viewer">
        {error ? (
          <p>{error}</p>
        ) : isLoading ? (
          <p>Loading stream...</p>
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
          <p>Stream not available.</p>
        )}
      </div>
      <h2>{streamtitle || "Stream Viewer"}</h2>
      <p>{streamdescription || "No description available"}</p>
    </div>
  );
}
