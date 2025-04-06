import http from "http";

export const streamProxy = (req, res) => {
  const targetUrl = `http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls${req.url}`;

  const options = {
    hostname: "ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
    path: `/hls${req.url}`,
    method: req.method,
    headers: {
      ...req.headers,
      "Cache-Control": "no-cache", // Force fresh response
      "If-Modified-Since": "", // Clear caching headers
      "If-None-Match": "", // Prevent 304
    },
    timeout: 10000,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      "Cache-Control": "no-cache", // Ensure client doesn’t cache
    });
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    res.status(502).send("Proxy failed: " + err.message);
  });

  proxyReq.on("timeout", () => {
    res.status(504).send("Proxy request timed out");
    proxyReq.destroy();
  });

  req.pipe(proxyReq);
};
