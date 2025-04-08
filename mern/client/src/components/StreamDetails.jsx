import { useState } from "react";

export default function StreamDetails() {
  const [streamState, setStreamState] = useState({
    streamTitle: "",
    Streamdescription: "",
  });

  const [error, setError] = useState(""); // For error messages
  const [success, setSuccess] = useState("");

  function updateHandler(e) {
    setStreamState({ ...streamState, [e.target.name]: e.target.value });
  }

  function handlePublishStream() {}

  return (
    <div className="stream-details">
      <h2>Stream Details</h2>
      <form className="stream-details-form" onSubmit={handlePublishStream}>
        <input
          className="stream-title-input"
          placeholder="Stream Title"
          onChange={updateHandler}
          name="text"
          required
          maxLength={40}
        />
        <textarea
          className="stream-description"
          placeholder="Stream Description"
          value={streamState}
          onChange={(e) => streamState(e.target.value)}
          required
          maxLength={150}
        />
        <button className="submit-button" type="submit">
          Publish Stream
        </button>
      </form>
      {/* Show success or error messages */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}
