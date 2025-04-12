import { useState } from "react";
import { publishStream } from "../api";

export default function StreamDetails({ streamUrl, userId, onStreamPublish }) {
  const [streamDetails, setStreamState] = useState({
    streamtitle: "",
    streamdescription: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPublishing, setIsPublishing] = useState(false); // New state

  function updateHandler(e) {
    setStreamState({ ...streamDetails, [e.target.name]: e.target.value });
  }

  async function handlePublishStream(e) {
    e.preventDefault();
    setIsPublishing(true); // Show publishing state
    setError("");
    setSuccess("");

    const fullStreamDetails = {
      ...streamDetails,
      streamerId: userId,
      streamUrl: streamUrl,
      isLive: true,
    };

    try {
      const response = await publishStream(fullStreamDetails);

      if (response.data && response.data.success) {
        setSuccess("Stream published successfully!");
        onStreamPublish();
        setError("");
      }
    } catch (err) {
      setError("Failed to publish stream.");
      setSuccess("");
      console.error(err);
    } finally {
      setIsPublishing(false); // Reset publishing state
    }
  }

  return (
    <div className="stream-details">
      <form className="stream-details-form" onSubmit={handlePublishStream}>
        <label>Stream Title</label>
        <input
          className="stream-title-input"
          placeholder="Stream Title"
          name="streamtitle"
          onChange={updateHandler}
          value={streamDetails.streamtitle}
          required
          maxLength={40}
        />
        <label>Stream Description</label>
        <textarea
          className="stream-description"
          placeholder="Stream Description"
          name="streamdescription"
          value={streamDetails.streamdescription}
          onChange={updateHandler}
          required
          maxLength={150}
        />
        <button
          className="publish-stream-button"
          type="submit"
          disabled={isPublishing} // Disable during publishing
        >
          {isPublishing ? "Publishing..." : "Publish Stream"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}
