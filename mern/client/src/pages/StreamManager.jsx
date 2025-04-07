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

  // Fetch stream status and reload logic
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const streamKey = decodedUser.streamKey;

    const fetchStreamKey = async () => {
      try {
        const url = await getStreamUrl(streamKey);
        setStreamUrl(url);
        if (!isLive) {
          setIsLive(true);
          window.location.reload();
        }
      } catch (error) {
        console.log("Stream check error:", error);
        if (isLive) {
          setIsLive(false);
          window.location.reload();
        }
      } finally {
        if (loading) setLoading(false);
      }
    };

    // Initial fetch
    fetchStreamKey();

    // Poll every 10 seconds
    const intervalId = setInterval(fetchStreamKey, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isLive]);

  // HLS setup
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
          console.log("Manifest parsed");
          videoRef.current.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data.type, data.details);
          if (data.fatal) {
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
