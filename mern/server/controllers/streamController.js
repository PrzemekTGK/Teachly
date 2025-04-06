import http from "http";

export const streamProxy = (req, res) => {
  console.log("Stream proxy started for:", req.url);

  const targetUrl = `http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls${req.url}`;
  console.log("Proxying to:", targetUrl);

  const options = {
    hostname: "ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
    path: `/hls${req.url}`,
    method: req.method,
    headers: req.headers,
    timeout: 10000, // 10 seconds timeout
  };

  const proxyReq = http.request(options, (proxyRes) => {
    console.log("Proxy response status:", proxyRes.statusCode);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res); // Stream the response back to the client
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy request error:", err.message);
    res.status(502).send("Proxy failed: " + err.message);
  });

  proxyReq.on("timeout", () => {
    console.error("Proxy request timed out");
    res.status(504).send("Proxy request timed out");
    proxyReq.destroy(); // Clean up the request
  });

  // Forward the client’s request body (if any) to the target server
  req.pipe(proxyReq);
};
