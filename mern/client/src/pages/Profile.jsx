// Import API functions for user, video, and image management
import {
  uploadImage,
  updateUser,
  getImage,
  deleteImage,
  getUserVideos,
  deleteVideos,
  deleteUser,
} from "../api.js";
// Import React hooks
import { useEffect, useState, useRef } from "react";
// Import jwtDecode to decode JWT tokens
import { jwtDecode } from "jwt-decode";
// Import profile-related components
import ViewerDetails from "../components/ViewerDetails.jsx";
import CreatorDetails from "../components/CreatorDetails.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import BecomeCreatorModal from "../components/BecomeCreatorModal.jsx";
import ChangePasswordModal from "../components/ChangePasswordModal.jsx";
// Import default profile image
import defaultProfileImage from "../assets/unknown.jpg";
// Import axios for HTTP requests
import axios from "axios";

// Define Profile component
export default function Profile() {
  // Maximum allowed file size for profile images
  const MAX_FILE_SIZE = 5000000;

  // State for user information
  const [user, setUserState] = useState();
  // State for managing profile image edit mode
  const [editProfileImage, setEditProfileImage] = useState(false);
  // State for selected profile image file
  const [selectProfileImage, setSelectProfileImage] = useState();
  // State for profile image URL
  const [profileImageUrl, setProfileImageUrl] = useState(defaultProfileImage);
  // State for user role
  const [userRole, setUserRole] = useState();
  // State for role update modal
  const [roleModal, setRoleModal] = useState(false);
  // State for confirmation modal
  const [confirmModal, setConfirmModal] = useState(false);
  // State for change password modal
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  // State to track the type of confirmation action
  const [confirmAction, setConfirmAction] = useState("");
  // State for error messages
  const [error, setError] = useState(null);
  // State for success messages
  const [success, setSuccess] = useState("");
  // Ref for file input element
  const inputFileRef = useRef(null);

  // Effect to load user data when component mounts or role changes
  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      const decodedUser = jwtDecode(token);
      setUserState(decodedUser);
      setUserRole(decodedUser.role);

      // Fetch profile image if available
      if (decodedUser.imageId) {
        try {
          const imageUrl = await getImage(decodedUser.imageId);
          setProfileImageUrl(imageUrl);
        } catch (error) {
          setProfileImageUrl(defaultProfileImage);
          setError("Error fetching profile image:", error);
        }
      }
    }

    loadUserData();
  }, [userRole]);

  // Handle toggling profile image edit mode
  function handleEditProfileImg() {
    setEditProfileImage(!editProfileImage);
    setSelectProfileImage();
  }

  // Handle selecting a profile image
  function handleSelectProfileImg(e) {
    const file = e.target.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));

    // Validate file extension
    if (
      fileExtension !== ".jpg" &&
      fileExtension !== ".jpeg" &&
      fileExtension !== ".png"
    ) {
      setError("Image must be .jpg, .jpeg or .png");
      inputFileRef.current.value = "";
      inputFileRef.current.type = "file";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Maximum file size is 5MB");
      inputFileRef.current.value = "";
      inputFileRef.current.type = "file";
      return;
    }

    setSelectProfileImage(file);
  }

  // Handle uploading a new profile image
  async function handleUploadProfileImg() {
    setError("");
    setSuccess("");

    if (profileImageUrl) {
      const token = sessionStorage.getItem("User");
      const currentImageId = jwtDecode(token).imageId;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Delete previous image if it exists
      if (!(profileImageUrl === defaultProfileImage)) {
        await deleteImage(currentImageId);
      }
    }

    if (!selectProfileImage) {
      setError("Failed to upload the file! - File does not exist");
      return;
    }

    try {
      const uploadedImage = await uploadImage(selectProfileImage);

      if (uploadedImage) {
        try {
          const updatedUser = {
            ...user,
            imageId: selectProfileImage.name,
          };
          const response = await updateUser(user._id, updatedUser);
          const newToken = response.data.token;
          const decodedUser = jwtDecode(newToken);
          const imageUrl = await getImage(decodedUser.imageId);

          sessionStorage.setItem("User", newToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

          inputFileRef.current.value = null;
          setProfileImageUrl(imageUrl);
          setUserState(decodedUser);
          setEditProfileImage(!editProfileImage);
          setSelectProfileImage();
        } catch (error) {
          setError(`Failed to upload an image: `, error.message);
        }
      }
    } catch (error) {
      setError(`Failed to upload an image: `, error.message);
      return `Failed to upload the file ${error.message}`;
    }
  }

  // Handle deleting profile image
  async function handleDeleteProfileImg() {
    if (profileImageUrl) {
      const token = sessionStorage.getItem("User");
      const decodedUser = jwtDecode(token);
      const imageId = decodedUser.imageId;
      const updatedUser = {
        ...decodedUser,
        imageId: "",
      };
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await deleteImage(imageId);
      await updateUser(decodedUser._id, updatedUser);
      setProfileImageUrl(defaultProfileImage);
    }
  }

  // Handle ceasing creator role
  async function handleCeaseCreator() {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    const newRole = "viewer";
    const updatedUser = { ...decodedUser, role: newRole };

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await updateUser(decodedUser._id, updatedUser);
      const newToken = response.data.token;
      sessionStorage.setItem("User", newToken);
      sessionStorage.removeItem("StreamKey");
      const decodedUserAfterUpdate = jwtDecode(newToken);
      setUserRole(decodedUserAfterUpdate.role);
    } catch (error) {
      setError("Failed to update user role:", error.message);
    }
  }

  // Handle deleting user profile
  async function handleDeleteProfile() {
    const token = sessionStorage.getItem("User");
    const userId = user._id;
    const imageId = user.imageId;

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const userVideos = await getUserVideos("uploaderId", userId);
      const videoIds = userVideos.map((video) => video._id);

      if (imageId) {
        await deleteImage(imageId);
      }

      if (videoIds.length > 0) {
        await deleteVideos(videoIds);
      }

      await deleteUser(userId);

      sessionStorage.removeItem("User");
      window.location.href = "/";
    } catch (error) {
      setError(error);
    }
  }

  // Handle updating user role
  function handleRoleUpdate(newRole) {
    setUserRole(newRole);
  }

  // Display loading state if user is not ready
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    // Main profile container
    <div className="scroll">
      <div className="profile-content">
        {/* Profile image */}
        <img className="profile-image" src={profileImageUrl} alt="Profile" />

        {/* Profile image editing buttons */}
        <span className="image-upload-span">
          {!editProfileImage ? (
            <>
              <button
                className="edit-profile-image-button"
                onClick={handleEditProfileImg}
              >
                {profileImageUrl === defaultProfileImage
                  ? "Upload Image"
                  : "Edit Image"}
              </button>
              <button
                className="delete-profile-image-button"
                onClick={() => {
                  if (!(profileImageUrl === defaultProfileImage)) {
                    setConfirmAction("deleteImage");
                    setConfirmModal(!confirmModal);
                  }
                }}
              >
                Delete Image
              </button>
            </>
          ) : (
            <>
              {!selectProfileImage ? (
                <></>
              ) : (
                <>
                  <button onClick={handleUploadProfileImg}>Upload</button>
                </>
              )}
              <>
                <input
                  type="file"
                  onChange={handleSelectProfileImg}
                  ref={inputFileRef}
                />
                <button
                  className="close-image-edit-button"
                  onClick={handleEditProfileImg}
                >
                  X
                </button>
              </>
            </>
          )}
        </span>

        {/* Details card */}
        <div className="details-card">
          <div>
            {/* Render ViewerDetails or CreatorDetails based on role */}
            {userRole === "viewer" ? (
              <>
                <ViewerDetails user={user} />
                <button
                  className="become-creator-button"
                  onClick={() => {
                    setRoleModal(!roleModal);
                  }}
                >
                  Become Creator
                </button>
              </>
            ) : (
              <>
                <CreatorDetails user={user} />
                <button
                  className="cease-creator-button"
                  onClick={() => {
                    setConfirmAction("ceaseCreator");
                    setConfirmModal(!confirmModal);
                  }}
                >
                  Stop Creating
                </button>
              </>
            )}
            <button
              className="change-password-button"
              onClick={() => {
                setChangePasswordModal(!changePasswordModal);
              }}
            >
              Change Password
            </button>
          </div>

          {/* Delete profile button */}
          <button
            className="delete-profile-button"
            onClick={() => {
              setConfirmAction("deleteProfile");
              setConfirmModal(!confirmModal);
            }}
          >
            Delete Profile
          </button>
        </div>

        {/* Error and success messages */}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* Modal for becoming a creator */}
        {roleModal && (
          <div className="modal-wrapper">
            <BecomeCreatorModal
              modalState={roleModal}
              setModalState={setRoleModal}
              onRoleUpdate={handleRoleUpdate}
            />
          </div>
        )}

        {/* Confirmation modal */}
        {confirmModal && (
          <div className="modal-wrapper">
            <ConfirmationModal
              modalState={confirmModal}
              setModalState={setConfirmModal}
              onConfirm={() => {
                if (confirmAction === "ceaseCreator") {
                  handleCeaseCreator();
                } else if (confirmAction === "deleteProfile") {
                  handleDeleteProfile();
                } else if (confirmAction === "deleteImage") {
                  handleDeleteProfileImg();
                }
              }}
            />
          </div>
        )}

        {/* Change password modal */}
        {changePasswordModal && (
          <div className="modal-wrapper">
            <ChangePasswordModal
              modalState={changePasswordModal}
              setModalState={setChangePasswordModal}
            />
          </div>
        )}
      </div>
    </div>
  );
}
