// server/controllers/streamController.js
import { createProxyMiddleware } from "http-proxy-middleware";
import { createProxyMiddleware } from "http-proxy-middleware";

export const streamProxy = (req, res, next) => {
  console.log("Stream proxy started for:", req.url);
  const proxy = createProxyMiddleware({
    target: "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
    changeOrigin: true,
    pathRewrite: { "^/api/stream/hls": "/hls" },
    onError: (err) => {
      console.error("Proxy error:", err.message);
      res.status(502).send("Bad Gateway");
    },
    onProxyReq: (proxyReq) => {
      console.log("Proxy request sent to:", proxyReq.path);
    },
    onProxyRes: (proxyRes) => {
      console.log("Proxy response status:", proxyRes.statusCode);
    },
  });
  try {
    proxy(req, res, (err) => {
      if (err) {
        console.error("Proxy next error:", err.message);
        return res.status(500).send("Proxy failed");
      }
      console.log("Proxy fallback triggered");
      res.status(404).send("Stream not found");
    });
  } catch (error) {
    console.error("Proxy execution error:", error.message);
    res.status(500).send("Proxy crashed");
  }
};
