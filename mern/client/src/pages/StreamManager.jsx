import { getStreamUrl } from "../api";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import StreamDetails from "../components/StreamDetails";

export default function StreamManager() {
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [userId, setUserId] = useState("");
  const streamRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);

    const streamKey = decodedUser.streamKey;
    setUserId(decodedUser._id);
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
    wsRef.current = new WebSocket("wss://teachly-backend.up.railway.app"); // Update to production URL later

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({ streamKey }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.streamKey === streamKey && data.action === "streamStarted") {
        fetchStreamKey();
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && streamUrl && streamRef.current && isLive) {
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
  }, [loading, streamUrl, isLive]);

  return (
    <div className="stream-manager-container">
      <h2>Stream Manager</h2>
      {loading ? (
        <p>Loading your stream...</p>
      ) : isLive ? (
        <div className="stream-manager">
          <video
            ref={streamRef}
            controls
            autoPlay
            width="640"
            height="360"
            crossOrigin="anonymous"
            className="stream-manager-video"
          />
          <StreamDetails
            streamUrl={streamUrl}
            userId={userId}
            streamRef={streamRef}
          />
        </div>
      ) : (
        <p>You're currently not streaming.</p>
      )}
    </div>
  );
}
