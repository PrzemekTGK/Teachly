import axios from "axios";
import { jwtDecode } from "jwt-decode";

const URL = "http://localhost:5000/api";

export async function checkPassword(currentPassword) {
  const token = sessionStorage.getItem("User"); // Retrieve the token from sessionStorage
  const decodedUser = jwtDecode(token); // Decode the token to get the user ID
  const userId = decodedUser._id; // Extract the user ID from the decoded token

  try {
    const response = await axios.post(
      `${URL}/users/check-password`,
      { userId, currentPassword }, // Send the userId and password to the backend
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
      }
    );

    return response.data.success; // Return whether the password is correct
  } catch (error) {
    console.error("Error validating password:", error);
    return false; // Return false if there's an error (like incorrect password)
  }
}

export async function changePassword(newPassword) {
  const token = sessionStorage.getItem("User"); // Retrieve the token from sessionStorage
  const decodedUser = jwtDecode(token); // Decode the token to get the user ID
  const userId = decodedUser._id; // Extract the user ID from the decoded token

  try {
    const response = await axios.put(
      `${URL}/users/change-password`,
      {
        userId,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
      }
    );

    return response.data; // Return the success message or any data returned by the API
  } catch (error) {
    return error.response?.data || { success: false, message: "Unknown error" };
  }
}

export async function getUsers() {
  try {
    const response = await axios.get(`${URL}/users`);
    return response.data;
  } catch (error) {
    console.error(`${error.message}`);
  }
}

export async function getUser(id) {
  try {
    const response = await axios.get(`${URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`${error.message}`);
  }
}

export async function createUser(user) {
  const { confirmPassword, ...userData } = user;

  try {
    const response = await axios.post(`${URL}/users`, userData);
    return response;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }

    return {
      data: {
        success: false,
        message: "An unexpected error occurred.",
      },
    };
  }
}

export async function updateUser(id, user) {
  try {
    const token = sessionStorage.getItem("User");
    const response = await axios.put(`${URL}/users/${id}`, user, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error(`${error.message}`);
  }
}

export async function deleteUser(id) {
  try {
    const response = await axios.delete(`${URL}/users/${id}`);
    return response;
  } catch (error) {
    console.error(`${error.message}`);
  }
}

export async function verifyUser(user) {
  try {
    const response = await axios.post(`${URL}/users/login`, user);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Unexpected error");
  }
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  try {
    const token = sessionStorage.getItem("User");
    const response = await axios.post(`${URL}/images/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.log(`Failed to upload the image ${error.message}`);
  }
}

export async function getImage(id) {
  try {
    const token = sessionStorage.getItem("User");
    const response = await axios.get(`${URL}/images/${id}`, {
      headers: {
        "Content-Type": "multipart/form-data", // Optional, depending on your server's requirements
        Authorization: `Bearer ${token}`, // Include the Authorization header
      },
    });

    if (!response.data) {
      throw new Error("No image data returned from the server");
    }
    return response.data;
  } catch (error) {
    console.error(`Failed to retrieve image from DB: `, error.response.data);
    throw new Error("No image data returned from the server");
  }
}

export async function deleteImage(id) {
  const token = sessionStorage.getItem("User");
  try {
    const response = await axios.delete(`${URL}/images/delete/${id}`, {
      headers: {
        "Content-Type": "multipart/form-data", // Optional, depending on your server's requirements
        Authorization: `Bearer ${token}`, // Include the Authorization header
      },
    });
    return response;
  } catch (error) {
    return error.response.data;
  }
}

export async function uploadVideo(file, title, description) {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("title", title);
  if (description) {
    formData.append("description", description);
  } else {
    formData.append("description", "");
  }

  try {
    const token = sessionStorage.getItem("User");
    const decodedUser = jwtDecode(token);
    formData.append("uploaderId", decodedUser._id);
    formData.append("uploader", decodedUser.username);

    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await axios.post(`${URL}/videos/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    if (error.response) {
      // If there's a response, handle it here
      return error.response.data.message; // Return the full response to be handled by the frontend.
    } else {
      // If there's no response (e.g., network error)
      return { status: 500, message: error.message }; // Return custom error for network errors.
    }
  }
}

export async function getVideos() {
  try {
    const response = await axios.get(`${URL}/videos`); // Assuming the endpoint for fetching all videos is /videos
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch videos: ${error.message}`);
    throw error; // Optionally handle the error in a way that the caller can handle it
  }
}

export async function getUserVideos(filterKey, filterValue) {
  try {
    // Construct the query parameters dynamically
    const response = await axios.get(`${URL}/videos`, {
      params: {
        [filterKey]: filterValue, // dynamically add the filter key and value
      },
    });
    return response.data;
  } catch (error) {
    error(`Failed to fetch videos: ${error.message}`);
    throw error;
  }
}
export async function deleteVideo(videoId) {
  const token = sessionStorage.getItem("User");
  try {
    const response = await axios.delete(`${URL}/videos/${videoId}`, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return error.response ? error.response.data : { error: error.message };
  }
}

export async function deleteVideos(videoIds) {
  const token = sessionStorage.getItem("User");
  try {
    const response = await axios.post(
      `${URL}/videos/delete`,
      { videoIds }, // Send videoIds in the request body
      {
        headers: {
          "Content-Type": "application/json", // Using application/json for the request body
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    return error.response ? error.response.data : { error: error.message };
  }
}

export const validatePassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

export const fetchHLSStream = async (streamFile) => {
  try {
    const response = await axios.get(`${URL}/api/hls/${streamFile}`, {
      responseType: "stream", // Important for handling video data
    });
    return response.data; // You can use this data to process the stream in your frontend
  } catch (error) {
    console.error("Error fetching HLS stream:", error);
    throw error;
  }
};
