// controllers/streamController.js
import fetch from "node-fetch";

export const proxyHLS = async (req, res) => {
  const { file } = req.params;
  const ec2BaseUrl = "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com"; // WITHOUT trailing slash

  try {
    const response = await fetch(`${ec2BaseUrl}/hls/${file}`);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch stream file");
    }

    // Forward headers and stream body
    res.set("Content-Type", response.headers.get("Content-Type"));
    response.body.pipe(res);
  } catch (error) {
    console.error("Stream proxy error:", error);
    res.status(500).send("Error proxying stream");
  }
};
