// Import Link component for client-side navigation
import { Link } from "react-router-dom";
// Import React hooks for state and side effects
import { useState, useEffect } from "react";
// Import API function to fetch streams
import { getStreams } from "../api";

// Define StreamBrowser component
export default function StreamBrowser() {
  // State for storing fetched streams
  const [streams, setStreams] = useState([]);

  // Effect to fetch streams when component mounts
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        // Fetch live streams from API
        const response = await getStreams();
        setStreams(response.data);
      } catch (err) {
        // Handle fetch errors
        console.error("Failed to load live streams:", err);
      }
    };
    fetchStreams();
  }, []);

  return (
    // Render stream browser container
    <div className="content-browser">
      {/* Stream browser title */}
      <h2 className="content-browser-title">Stream Browser</h2>

      {/* Grid layout for displaying streams */}
      <div className="video-grid">
        {/* Check if streams are available */}
        {streams.length > 0 ? (
          streams.map((stream) => (
            // Render each stream item
            <div key={stream._id} className="video-item">
              {/* Link to stream viewer page with stream data passed via state */}
              <Link
                to={`/streamViewer/${stream._id}`}
                state={{
                  streamId: stream._id,
                  streamerId: stream.streamerId,
                  streamUrl: stream.streamUrl,
                  streamtitle: stream.streamtitle,
                  streamdescription: stream.streamdescription,
                }}
                className="video-title"
              >
                {/* Stream thumbnail image */}
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.streamtitle}
                  width="320"
                  height="180"
                />
                {/* Stream title */}
                {stream.streamtitle}
              </Link>
            </div>
          ))
        ) : (
          // Display message if no streams available
          <p>No streams available.</p>
        )}
      </div>
    </div>
  );
}
