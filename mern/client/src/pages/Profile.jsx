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
import { ViewerDetails } from "../components/ViewerDetails.jsx";
import { CreatorDetails } from "../components/CreatorDetails.jsx";
import defaultProfileImage from "../assets/unknown.jpg";
import * as jwt_decode from "jwt-decode";
import axios from "axios";

export function Profile() {
  const MAX_FILE_SIZE = 5000000;
  const [userState, setUserState] = useState();
  const [editProfileImgState, setEditProfileImgState] = useState(false);
  const [selectProfileImgState, setSelectProfileImgState] = useState();
  const [profileImgUrl, setProfileImgUrl] = useState(defaultProfileImage);
  const [roleState, setRoleState] = useState();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const inputFileRef = useRef(null);

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      const decodedUser = jwt_decode.jwtDecode(token);
      setUserState(decodedUser);
      setRoleState(decodedUser.role);
      if (decodedUser.imageId) {
        try {
          const imageUrl = await getImage(decodedUser.imageId);
          setProfileImgUrl(imageUrl); // Update only if imageUrl is valid
        } catch (error) {
          setProfileImgUrl(defaultProfileImage);
          console.error("Error fetching profile image:", error);
        }
      }
    }

    loadUserData();
  }, []);

  function editProfileImg() {
    setEditProfileImgState(!editProfileImgState);
    setSelectProfileImgState();
  }

  function selectProfileImg(e) {
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
    setSelectProfileImgState(file);
  }

  async function uploadProfileImg() {
    setError("");
    setSuccess("");
    if (profileImgUrl) {
      console.log(`PROFILE IMAGE URL: `, profileImgUrl);
      const token = sessionStorage.getItem("User");
      const currentImageId = jwt_decode.jwtDecode(token).imageId;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (!profileImgUrl === "/src/assets/unknown.jpg") {
        await deleteImage(currentImageId);
      }
    }

    if (!selectProfileImgState) {
      setError("Failed to upload the file! - File does not exist");
      return;
    }

    try {
      const uploadedImage = await uploadImage(selectProfileImgState);
      if (uploadedImage) {
        try {
          const updatedUser = {
            ...userState,
            imageId: selectProfileImgState.name,
          };
          const response = await updateUser(updatedUser._id, updatedUser);
          const newToken = response.data.token;
          const decodedUser = jwt_decode.jwtDecode(newToken);
          const imageUrl = await getImage(decodedUser.imageId);
          sessionStorage.setItem("User", newToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          inputFileRef.current.value = null;
          setProfileImgUrl(imageUrl);
          setUserState(decodedUser);
          setEditProfileImgState(!editProfileImgState);
          setSelectProfileImgState();
        } catch (error) {
          setError(`Failed to upload an image: `, error.message);
        }
      }
    } catch (error) {
      setError(`Failed to upload an image: `, error.message);
      return `Failed to upload the file ${error.message}`;
    }
  }

  async function deleteProfileImg() {
    if (profileImgUrl) {
      const token = sessionStorage.getItem("User");
      const user = jwt_decode.jwtDecode(token);
      const imageId = user.imageId;
      const updatedUser = {
        ...user,
        imageId: "",
      };
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await deleteImage(imageId);
      await updateUser(user._id, updatedUser);
      setProfileImgUrl(defaultProfileImage);
    }
  }

  async function setUserRole() {
    const token = sessionStorage.getItem("User");
    const user = jwt_decode.jwtDecode(token);
    const newRole = user.role === "viewer" ? "creator" : "viewer";

    const updatedUser = { ...user, role: newRole };

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await updateUser(user._id, updatedUser);
      const newToken = response.data.token;
      sessionStorage.setItem("User", newToken);

      const decodedUser = jwt_decode.jwtDecode(newToken);
      setRoleState(decodedUser.role);
    } catch (error) {
      setError("Failed to update user role:", error.message);
    }
  }

  async function handleDeleteProfile() {
    const token = sessionStorage.getItem("User");
    const userId = userState._id;
    const imageId = userState.imageId;

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const userVideos = await getUserVideos("uploaderId", userId);
      console.log(`User Vidoes: `, userVideos);

      const videoIds = userVideos.map((video) => video._id);
      console.log(`Video IDs: `, videoIds);

      if (imageId) {
        console.log("Profile has IMAGE!");
        await deleteImage(imageId);
      }

      if (videoIds.length > 0) {
        console.log("Profile has VIDEOS!");
        await deleteVideos(videoIds);
      }
      await deleteUser(userId);

      sessionStorage.removeItem("User"); // Remove user data from session
      window.location.href = "/";
    } catch (error) {
      setError(error);
    }
  }

  if (!userState) {
    return <div>Loading...</div>; // Show a loading message or spinner while userState is being set
  }

  return (
    <div className="profile-content">
      <img className="profile-image" src={profileImgUrl} alt="Profile" />
      <span className="image-upload-span">
        {!editProfileImgState ? (
          <>
            <button
              className="edit-profile-image-button"
              onClick={editProfileImg}
            >
              {profileImgUrl === defaultProfileImage
                ? "Upload Image"
                : "Edit Image"}
            </button>
            <button
              className="delete-profile-image-button"
              onClick={deleteProfileImg}
            >
              Delete Image
            </button>
          </>
        ) : (
          <>
            {!selectProfileImgState ? (
              <></>
            ) : (
              <>
                <button onClick={uploadProfileImg}>Upload</button>
              </>
            )}
            <>
              <input
                type="file"
                onChange={selectProfileImg}
                ref={inputFileRef}
              />
              <button
                className="close-image-edit-button"
                onClick={editProfileImg}
              >
                X
              </button>
            </>
          </>
        )}
      </span>
      <div className="details-card">
        <div>
          {roleState === "viewer" ? (
            <>
              <ViewerDetails userState={userState} />
              <button className="become-creator-button" onClick={setUserRole}>
                Become Creator
              </button>
            </>
          ) : (
            <>
              <CreatorDetails userState={userState} />
              <button className="cease-creator-button" onClick={setUserRole}>
                Stop Creating
              </button>
            </>
          )}
          <button className="change-password-button">Change Password</button>
        </div>
        <button className="delete-profile-button" onClick={handleDeleteProfile}>
          Delete Profile
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}
