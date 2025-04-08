import {
  uploadImage,
  updateUser,
  getImage,
  deleteImage,
  getUserVideos,
  deleteVideos,
  deleteUser,
} from "../api.js";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import ViewerDetails from "../components/ViewerDetails.jsx";
import CreatorDetails from "../components/CreatorDetails.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import BecomeCreatorModal from "../components/BecomeCreatorModal.jsx";
import ChangePasswordModal from "../components/ChangePasswordModal.jsx";
import defaultProfileImage from "../assets/unknown.jpg";
import axios from "axios";

export default function Profile() {
  const MAX_FILE_SIZE = 5000000;
  const [user, setUserState] = useState();
  const [editProfileImage, setEditProfileImage] = useState(false);
  const [selectProfileImage, setSelectProfileImage] = useState();
  const [profileImageUrl, setProfileImageUrl] = useState(defaultProfileImage);
  const [userRole, setUserRole] = useState();
  const [roleModal, setRoleModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const inputFileRef = useRef(null);

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      const decodedUser = jwtDecode(token);
      setUserState(decodedUser);
      setUserRole(decodedUser.role);
      if (decodedUser.imageId) {
        try {
          const imageUrl = await getImage(decodedUser.imageId);
          setProfileImageUrl(imageUrl); // Update only if imageUrl is valid
        } catch (error) {
          setProfileImageUrl(defaultProfileImage);
          setError("Error fetching profile image:", error);
        }
      }
    }

    loadUserData();
  }, [userRole]);

  function handleEditProfileImg() {
    setEditProfileImage(!editProfileImage);
    setSelectProfileImage();
  }

  function handleSelectProfileImg(e) {
    const file = e.target.files[0];
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
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

    if (file.size > MAX_FILE_SIZE) {
      setError("Maximum file size is 5MB");
      inputFileRef.current.value = "";
      inputFileRef.current.type = "file";
      return;
    }
    setSelectProfileImage(file);
  }

  async function handleUploadProfileImg() {
    setError("");
    setSuccess("");
    if (profileImageUrl) {
      const token = sessionStorage.getItem("User");
      const currentImageId = jwtDecode(token).imageId;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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

      sessionStorage.removeItem("User"); // Remove user data from session
      window.location.href = "/";
    } catch (error) {
      setError(error);
    }
  }

  function handleRoleUpdate(newRole) {
    setUserRole(newRole);
  }

  if (!user) {
    return <div>Loading...</div>; // Show a loading message or spinner while userState is being set
  }

  return (
    <div className="scroll">
      <div className="profile-content">
        <img className="profile-image" src={profileImageUrl} alt="Profile" />
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
        <div className="details-card">
          <div>
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
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {roleModal && (
          <div className="modal-wrapper">
            <BecomeCreatorModal
              modalState={roleModal}
              setModalState={setRoleModal}
              onRoleUpdate={handleRoleUpdate}
            />
          </div>
        )}
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
