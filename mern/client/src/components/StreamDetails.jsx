// Import React hook for state management
import { useState } from "react";
// Import API function to publish a stream
import { publishStream } from "../api";

// Define StreamDetails component
export default function StreamDetails({ streamUrl, userId, onStreamPublish }) {
  // State for storing stream title and description
  const [streamDetails, setStreamState] = useState({
    streamtitle: "",
    streamdescription: "",
  });

  // State for displaying error messages
  const [error, setError] = useState("");
  // State for displaying success messages
  const [success, setSuccess] = useState("");
  // State for handling publishing button state
  const [isPublishing, setIsPublishing] = useState(false);

  // Handle form input changes and update stream details
  function updateHandler(e) {
    setStreamState({ ...streamDetails, [e.target.name]: e.target.value });
  }

  // Handle stream publish form submission
  async function handlePublishStream(e) {
    e.preventDefault();
    setIsPublishing(true); // Set publishing state
    setError("");
    setSuccess("");

    // Construct full stream details object
    const fullStreamDetails = {
      ...streamDetails,
      streamerId: userId,
      streamUrl: streamUrl,
      isLive: true,
    };

    try {
      // Call API to publish stream
      const response = await publishStream(fullStreamDetails);

      // Handle successful publish
      if (response.data && response.data.success) {
        setSuccess("Stream published successfully!");
        onStreamPublish(); // Callback after successful publish
        setError("");
      }
    } catch (err) {
      // Handle publish errors
      setError("Failed to publish stream.");
      setSuccess("");
      console.error(err);
    } finally {
      setIsPublishing(false); // Reset publishing state
    }
  }

  return (
    // Render stream details container
    <div className="stream-details">
      {/* Render stream details form */}
      <form className="stream-details-form" onSubmit={handlePublishStream}>
        {/* Stream title input */}
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
        {/* Stream description textarea */}
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
        {/* Publish stream button */}
        <button
          className="publish-stream-button"
          type="submit"
          disabled={isPublishing} // Disable button while publishing
        >
          {isPublishing ? "Publishing..." : "Publish Stream"}
        </button>
      </form>
      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}
      {/* Display success message if any */}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}
