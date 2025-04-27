// Import React hooks for state and ref management
import { useState, useRef } from "react";
// Import API function to upload videos
import { uploadVideo } from "../api";

// Define ContentUpload component
export default function ContentUpload() {
  // State for storing selected video file
  const [selectedFile, setSelectedFile] = useState(null);
  // State for managing loading status
  const [loading, setLoading] = useState(false);
  // State for managing error messages
  const [error, setError] = useState(null);
  // State for displaying success messages
  const [success, setSuccess] = useState("");
  // State for storing video title
  const [title, setTitle] = useState("");
  // State for storing video description
  const [description, setDescription] = useState("");
  // Ref for the file input to reset it when needed
  const fileInputRef = useRef(null);

  // Handle file selection and validate file type and size
  function handleFileChange(e) {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      if (file.type !== "video/mp4") {
        setError("Please upload an MP4 file.");
        setSelectedFile(null);
        fileInputRef.current.value = "";
        return;
      }

      // Validate file size (must be < 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setError("File size must be less than 500MB.");
        setSelectedFile(null);
        fileInputRef.current.value = "";
        return;
      }

      // Set selected file if valid
      setSelectedFile(file);
    }
  }

  // Handle video upload
  async function handleUpload() {
    // Check if file is selected
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    // Check if title is provided
    if (!title) {
      setError("Please provide title!");
      return;
    }

    // Start loading and reset error/success messages
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Call API to upload video
      const response = await uploadVideo(selectedFile, title, description);

      // Handle successful upload
      if (response && response.status === 200) {
        setSuccess("Video uploaded successfully!");
        setSelectedFile(null);
        fileInputRef.current.value = "";
        setTitle("");
        setDescription("");
      } else {
        // Handle API error response
        setError(response);
      }
    } catch (error) {
      // Handle unexpected errors
      setError(`Error: `, error);
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    // Render upload container
    <div className="upload-container">
      {/* Render upload form */}
      <form className="upload-video-form">
        {/* Upload page title */}
        <h2 className="upload-page-title">Upload Your Video</h2>

        {/* Upload box containing inputs */}
        <div className="upload-box">
          {/* File input for video upload */}
          <input
            className="upload-video-input"
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          {/* Render title and description inputs when file is selected */}
          {selectedFile && (
            <div>
              {/* Title input */}
              <input
                className="upload-video-title"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {/* Description textarea */}
              <textarea
                className="upload-video-decription"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          {/* Upload button */}
          <button
            className="upload-video-button"
            onClick={handleUpload}
            disabled={loading} // Disable button during upload
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

          {/* Display error message if any */}
          {error && <p className="error-message">{error}</p>}

          {/* Display success message if any */}
          {success && <p className="success-message">{success}</p>}
        </div>
      </form>
    </div>
  );
}
