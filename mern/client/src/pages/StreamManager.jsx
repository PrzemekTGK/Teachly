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
  const hasMounted = useRef(false); // Track if this is the initial render

  // Poll stream status and handle reload
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const streamKey = decodedUser.streamKey;

    const checkStreamStatus = async () => {
      try {
        const url = await getStreamUrl(streamKey);
        const newIsLive = !!url; // True if url exists, false if not

        // Only update state and reload if the live status has changed
        if (newIsLive !== isLive) {
          setStreamUrl(url || "");
          setIsLive(newIsLive);

          // Skip reload on initial mount
          if (hasMounted.current && newIsLive !== isLive) {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Stream check error:", error);
        if (isLive) {
          // Only update if currently live
          setStreamUrl("");
          setIsLive(false);
          if (hasMounted.current) {
            window.location.reload();
          }
        }
      }
    };

    // Initial check
    checkStreamStatus().then(() => {
      setLoading(false);
      hasMounted.current = true; // Mark as mounted after first check
    });

    // Poll every 30 seconds
    const intervalId = setInterval(checkStreamStatus, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isLive]); // Depend on isLive to ensure we compare against the current state

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
            setStreamUrl("");
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
