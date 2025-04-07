import { getStreamUrl } from "../api";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import StreamDetails from "../components/StreamDetails";

export default function StreamManager() {
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef(null);
  const prevIsLiveRef = useRef(false); // Track previous isLive state

  // Poll stream status and manage reloads
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const streamKey = decodedUser.streamKey;

    const checkStreamStatus = async () => {
      try {
        const url = await getStreamUrl(streamKey);
        if (url && !streamUrl) {
          // Stream is available and we didn’t have a URL before
          setStreamUrl(url);
          setIsLive(true);
        }
      } catch (error) {
        if (streamUrl) {
          // Stream stopped (URL was present, now unavailable)
          setStreamUrl("");
          setIsLive(false);
        }
      }
    };

    // Initial check
    checkStreamStatus().then(() => setLoading(false));

    // Poll every 30 seconds
    const intervalId = setInterval(checkStreamStatus, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [streamUrl]); // Depend on streamUrl, not isLive

  // Trigger reload only when isLive changes
  useEffect(() => {
    if (loading) return; // Skip during initial load
    if (prevIsLiveRef.current !== isLive) {
      window.location.reload(); // Reload on actual state change
    }
    prevIsLiveRef.current = isLive; // Update previous state
  }, [isLive, loading]);

  // HLS setup for video playback
  useEffect(() => {
    if (!loading && streamUrl && videoRef.current && isLive) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data.type, data.details);
          if (data.fatal) {
            setStreamUrl(""); // Clear URL on fatal error
            setIsLive(false);
          }
        });
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = streamUrl;
        videoRef.current.addEventListener("loadedmetadata", () => {
          videoRef.current.play();
        });
      }
    }
  }, [loading, streamUrl, isLive]);

  return (
    <div>
      <h2>Stream Manager</h2>
      {loading ? (
        <p>Loading your stream...</p>
      ) : isLive ? (
        <div>
          <video
            ref={videoRef}
            controls
            autoPlay
            width="640"
            height="360"
            crossOrigin="anonymous"
          />
          <StreamDetails />
        </div>
      ) : (
        <p>You're currently not streaming.</p>
      )}
    </div>
  );
}
