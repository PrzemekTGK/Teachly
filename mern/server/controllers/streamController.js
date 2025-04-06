import axios from "axios";

export const streamProxy = async (req, res) => {
  console.log("Stream proxy started for:", req.url);
  const targetUrl = `http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls${req.url}`;
  console.log("Requesting:", targetUrl);
  try {
    const response = await axios.head(targetUrl);
    console.log("EC2 response status:", response.status);
    res.status(200).end(); // HEAD response, no body
  } catch (error) {
    console.error("EC2 error:", error.response?.status || error.message);
    res.status(error.response?.status || 404).end();
  }
};
