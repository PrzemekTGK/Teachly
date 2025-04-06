import { createProxyMiddleware } from "http-proxy-middleware";

export const streamProxy = (req, res, next) => {
  console.log("Stream proxy started for:", req.url);
  try {
    const proxy = createProxyMiddleware({
      target: "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
      changeOrigin: true,
      pathRewrite: { "^/api/stream/hls": "/hls" },
      timeout: 10000, // Wait 10 seconds before timing out
      proxyTimeout: 10000, // Ensure proxy itself times out too
      onError: (err, req, res) => {
        console.error("Proxy error:", err.message);
        res.status(502).send("Proxy failed: " + err.message);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log("Proxy request sent to:", proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log("Proxy response status:", proxyRes.statusCode);
      },
    });
    console.log("Proxy executing...");
    proxy(req, res, (err) => {
      console.log("Proxy callback, error:", err ? err.message : "none");
      if (err) {
        res.status(500).send("Proxy callback error: " + err.message);
      } else if (!res.headersSent) {
        console.log("No response sent, forcing 404");
        res.status(404).send("No response from proxy");
      }
    });
  } catch (error) {
    console.error("Proxy setup error:", error.message);
    res.status(500).send("Proxy setup failed: " + error.message);
  }
};
