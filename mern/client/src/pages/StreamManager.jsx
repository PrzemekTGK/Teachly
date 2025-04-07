import { getStreamUrl } from "../api"; // Adjust path to your api.js
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import StreamDetails from "../components/StreamDetails";

export default function StreamManager() {
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false); // Track if the stream is live
  const videoRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);

    const streamKey = decodedUser.streamKey;
    const fetchStreamKey = async () => {
      try {
        const url = await getStreamUrl(streamKey);
        setStreamUrl(url);
        setIsLive(true);
      } catch (error) {
        console.log(error);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamKey();
  }, []);

  useEffect(() => {
    if (!loading && streamUrl && videoRef.current && isLive) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          liveSyncDurationCount: 3, // Sync to 3 segments
          liveMaxLatencyDurationCount: 10, // Allow up to 10 segments latency
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data.type, data.details);
        });
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = streamUrl;
        videoRef.current.addEventListener("loadedmetadata", () => {
          videoRef.current.play();
          console.log("STREAM IS LIVE");
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
          <StreamDetails></StreamDetails>
        </div>
      ) : (
        <p>You're currently not streaming.</p>
      )}
    </div>
  );
}
