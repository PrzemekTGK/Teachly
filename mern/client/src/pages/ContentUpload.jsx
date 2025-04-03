import { useState, useRef } from "react";
import { uploadVideo } from "../api";

export default function ContentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];

    if (file) {
      if (file.type !== "video/mp4") {
        setError("Please upload an MP4 file.");
        setSelectedFile(null);
        fileInputRef.current.value = "";
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        setError("File size must be less than 500MB.");
        setSelectedFile(null);
        fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    if (!title) {
      setError("Please provide title!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await uploadVideo(selectedFile, title, description);

      if (response && response.status === 200) {
        setSuccess("Video uploaded successfully!");
        setSelectedFile(null);
        fileInputRef.current.value = "";
        setTitle("");
        setDescription("");
      } else {
        setError(response);
      }
    } catch (error) {
      setError(`Error: `, error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-container">
      <form className="upload-video-form">
        <h2 className="upload-page-title">Upload Your Video</h2>
        <div className="upload-box">
          <input
            className="upload-video-input"
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {selectedFile && (
            <div>
              <p className="upload-video-name">
                {`File name: ` + selectedFile.name}
              </p>

              <input
                className="upload-video-title"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="upload-video-decription"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}
          <button
            className="upload-video-button"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </div>
      </form>
    </div>
  );
}
