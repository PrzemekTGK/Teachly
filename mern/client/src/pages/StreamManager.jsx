import React, { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Hls from "hls.js";
import { fetchHLSStream } from "../backend/api"; // Make sure to adjust the import path

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
        // Call the backend API to get the stream data
        const streamData = await fetchHLSStream(`${streamKey}.m3u8`);

        if (streamData) {
          setStreamUrl(streamData); // This will be the proxy URL from the backend
          setIsLive(true);
        } else {
          setIsLive(false); // Stream not live, or not available
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching stream:", error);
        setLoading(false);
        setIsLive(false); // Consider not live if there was an error
      }
    };

    fetchStreamKey();
  }, []);

  useEffect(() => {
    if (!loading && streamUrl && videoRef.current && isLive) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
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
        <video
          ref={videoRef}
          controls
          autoPlay
          width="640"
          height="360"
          crossOrigin="anonymous"
        />
      ) : (
        <p>You're currently not streaming.</p>
      )}
    </div>
  );
}
