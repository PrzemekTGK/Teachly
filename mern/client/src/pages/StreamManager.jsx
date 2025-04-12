import { getStreamUrl, getStream } from "../api";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import StreamDetails from "../components/StreamDetails";

export default function StreamManager() {
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(true); // Default to true for initial load
  const [isLive, setIsLive] = useState(false); // Default to false
  const [userId, setUserId] = useState("");
  const [streamPublished, setStreamPublished] = useState(false); // Default to false
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
        console.log("STREAM URL:", url);
        setIsLive(true);

        const streamResponse = await getStream(streamKey);
        console.log("StreamManager getStream:", streamResponse);
        if (streamResponse.success && streamResponse.data) {
          setStreamPublished(true);
        }
      } catch (error) {
        console.log("Fetch stream error:", error);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamKey();

    // WebSocket setup
    wsRef.current = new WebSocket("wss://teachly-backend.up.railway.app");

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({ streamKey }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.streamKey === streamKey) {
        if (data.action === "streamStarted") {
          fetchStreamKey();
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
          if (data.fatal) setIsLive(false); // Stop on fatal errors
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
        </div>
      ) : (
        <p>You're currently not streaming.</p>
      )}
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
