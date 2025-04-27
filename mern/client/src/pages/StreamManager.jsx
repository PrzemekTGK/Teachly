// Import API functions for fetching stream info
import { getStreamUrl, getStream } from "../api";
// Import jwtDecode for decoding user token
import { jwtDecode } from "jwt-decode";
// Import React hooks and HLS.js for stream playback
import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
// Import StreamDetails component for publishing stream metadata
import StreamDetails from "../components/StreamDetails";

// Define StreamManager component
export default function StreamManager() {
  // State for storing stream URL
  const [streamUrl, setStreamUrl] = useState("");
  // State for tracking loading status
  const [loading, setLoading] = useState(true);
  // State for tracking if stream is live
  const [isLive, setIsLive] = useState(false);
  // State for storing user ID
  const [userId, setUserId] = useState("");
  // State for tracking if stream metadata has been published
  const [streamPublished, setStreamPublished] = useState(false);
  // Ref for video element
  const streamRef = useRef(null);
  // Ref for WebSocket connection
  const wsRef = useRef(null);

  // Effect to initialize user info, stream, and WebSocket
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const streamKey = decodedUser.streamKey;
    setUserId(decodedUser._id);

    const fetchStreamKey = async () => {
      try {
        // Fetch the stream URL
        const url = await getStreamUrl(streamKey);
        setStreamUrl(url);
        setIsLive(true);

        // Check if stream metadata is already published
        const streamResponse = await getStream(streamKey);
        if (streamResponse.success && streamResponse.data) {
          setStreamPublished(true);
        }
      } catch (error) {
        console.log("Fetch stream error:", error);
        setIsLive(false);
      } finally {
        setLoading(false); // Set loading to false after attempt
      }
    };

    fetchStreamKey();

    // Setup WebSocket connection to listen for stream events
    wsRef.current = new WebSocket("wss://teachly-backend.up.railway.app");

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({ streamKey }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.streamKey === streamKey) {
        if (data.action === "streamStarted") {
          fetchStreamKey(); // Reload stream when stream starts
        } else if (data.action === "streamStopped") {
          setIsLive(false);
          setStreamPublished(false);
        }
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Cleanup WebSocket on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Effect to initialize HLS.js player once stream URL is available
  useEffect(() => {
    if (!loading && streamUrl && streamRef.current && isLive) {
      if (Hls.isSupported()) {
        // Setup HLS.js if supported
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
          if (data.fatal) setIsLive(false);
        });
      } else if (
        streamRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        // Fallback for native HLS support (Safari)
        streamRef.current.src = streamUrl;
        streamRef.current.addEventListener("loadedmetadata", () => {
          streamRef.current.play();
        });
      }
    }
  }, [loading, streamUrl, isLive]);

  return (
    // Main stream manager container
    <div className="stream-manager-container">
      {/* Stream Manager Title */}
      <h2>Stream Manager</h2>

      {/* Conditional rendering based on loading and live status */}
      {loading ? (
        <p>Loading your stream...</p>
      ) : isLive ? (
        <div className="stream-manager">
          {/* Stream video player */}
          <video
            ref={streamRef}
            controls
            autoPlay
            width="640"
            height="360"
            crossOrigin="anonymous"
            className="stream-manager-video"
          />
        </div>
      ) : (
        <p>You're currently not streaming.</p>
      )}

      {/* Render stream details form if stream is live but not yet published */}
      {!streamPublished && isLive && (
        <StreamDetails
          streamUrl={streamUrl}
          userId={userId}
          onStreamPublish={() => setStreamPublished(true)}
        />
      )}
    </div>
  );
}
