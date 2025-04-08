import { useState } from "react";

export default function StreamDetails() {
  const [streamDetails, setStreamState] = useState({
    streamTitle: "",
    streamDescription: "",
  });

  const [error, setError] = useState(""); // For error messages
  const [success, setSuccess] = useState("");

  function updateHandler(e) {
    setStreamState({ ...streamDetails, [e.target.name]: e.target.value });
  }

  function handlePublishStream() {}

  return (
    <div className="stream-details">
      <form className="stream-details-form" onSubmit={handlePublishStream}>
        <label>Stream Title</label>
        <input
          className="stream-title-input"
          placeholder="Stream Title"
          onChange={updateHandler}
          name="text"
          value={streamDetails.streamTitle}
          required
          maxLength={40}
        />
        <label>Stream Description</label>
        <textarea
          className="stream-description"
          placeholder="Stream Description"
          value={streamDetails.streamDescription}
          onChange={updateHandler}
          required
          maxLength={150}
        />
        <button className="publish-stream-button" type="submit">
          Publish Stream
        </button>
      </form>
      {/* Show success or error messages */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}
