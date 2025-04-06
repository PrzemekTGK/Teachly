import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Hls from "hls.js";

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
        // Generate the stream URL
        const url = `http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls/${streamKey}.m3u8`;

        // Check if the stream is accessible (i.e., live)
        const response = await axios.head(url);

        // If the response status is 200, the stream is live
        if (response.status === 200) {
          setStreamUrl(url);
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
