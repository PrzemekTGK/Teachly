// server/controllers/streamController.js
import { createProxyMiddleware } from "http-proxy-middleware";

import { createProxyMiddleware } from "http-proxy-middleware";

export const streamProxy = async (req, res, next) => {
  console.log("Stream proxy started for:", req.url);
  try {
    const proxy = createProxyMiddleware({
      target: "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
      changeOrigin: true,
      pathRewrite: { "^/api/stream/hls": "/hls" },
      onError: (err, req, res) => {
        console.error("Proxy error:", err.message);
        res.status(500).send("Proxy failed");
      },
      onProxyReq: (proxyReq, req) => {
        console.log("Proxy request sent to:", proxyReq.path);
      },
      onProxyRes: (proxyRes) => {
        console.log("Proxy response status:", proxyRes.statusCode);
      },
    });
    proxy(req, res, next);
  } catch (error) {
    console.error("Proxy setup error:", error.message);
    next(error);
  }
};
