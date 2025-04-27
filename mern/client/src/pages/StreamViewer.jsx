// Import React hooks and router tools
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
// Import HLS.js for HLS stream playback
import Hls from "hls.js";
// Import API function to fetch stream data
import { getStream } from "../api";

// Define StreamViewer component
export default function StreamViewer() {
  // Get location state passed from Link
  const { state } = useLocation();
  // Get stream ID from URL params
  const { id } = useParams();
  // Ref for video element
  const streamRef = useRef(null);
  // State for stream data
  const [streamData, setStreamData] = useState(state || {});
  // State for tracking errors
  const [error, setError] = useState(null);
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(!state || !state.streamUrl);

  // Destructure necessary fields from streamData
  const { streamUrl, streamtitle, streamdescription } = streamData;

  // Effect to fetch stream data if not already passed via state
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

    // Fetch only if no initial state or missing streamUrl
    if (!state || !state.streamUrl) {
      fetchStreamData();
    }
  }, [id, state]);

  // Effect to setup HLS or native streaming once streamUrl is ready
  useEffect(() => {
    const videoElement = streamRef.current;

    if (streamUrl && videoElement && !error) {
      console.log("Loading streamUrl:", streamUrl);

      // Verify stream URL is accessible
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

    // Function to initialize HLS.js player or native HLS
    function loadStream(videoElement) {
      if (!videoElement) {
        console.log("No video element, aborting load");
        setError("Video element not found");
        return;
      }

      // Setup HLS.js if supported
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
        // Native HLS support (Safari)
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

    // Cleanup on unmount: pause the video
    return () => {
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, [streamUrl, id, error]);

  return (
    // Stream viewer main container
    <div className="stream-viewer-container">
      <div className="stream-viewer">
        {/* Conditional rendering based on loading and error states */}
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

      {/* Stream title and description */}
      <h2>{streamtitle || "Stream Viewer"}</h2>
      <p>{streamdescription || "No description available"}</p>
    </div>
  );
}
