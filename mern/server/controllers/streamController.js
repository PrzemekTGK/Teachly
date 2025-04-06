// controllers/streamController.js
import fetch from "node-fetch";

export const proxyHLS = async (req, res) => {
  const { file } = req.params;
  const streamUrl = `http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls/${file}`;

  console.log(`[ProxyHLS] Incoming request for file: ${file}`);
  console.log(`[ProxyHLS] Fetching from: ${streamUrl}`);

  try {
    const response = await fetch(streamUrl);

    // Log status and headers
    console.log(`[ProxyHLS] Response status: ${response.status}`);
    console.log(
      `[ProxyHLS] Content-Type: ${response.headers.get("content-type")}`
    );

    if (!response.ok) {
      console.error(`[ProxyHLS] Failed to fetch: ${response.statusText}`);
      return res
        .status(response.status)
        .send(`Failed to fetch HLS stream: ${response.statusText}`);
    }

    // Set the correct content type (e.g., application/vnd.apple.mpegurl or video/MP2T)
    res.setHeader("Content-Type", response.headers.get("content-type"));

    // Stream it to the frontend
    response.body.pipe(res);
  } catch (error) {
    console.error(`[ProxyHLS] Error occurred: ${error.message}`);
    res.status(500).send("Error proxying HLS stream");
  }
};
