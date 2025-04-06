import { createProxyMiddleware } from "http-proxy-middleware";

export const streamProxy = (req, res, next) => {
  console.log("Stream proxy started for:", req.url);
  try {
    const proxy = createProxyMiddleware({
      target: "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
      changeOrigin: true,
      pathRewrite: { "^/api/stream/hls": "/hls" },
      onError: (err) => {
        console.error("Proxy error:", err.message);
        res.status(502).end();
      },
      onProxyReq: (proxyReq) => {
        console.log("Proxy request sent to:", proxyReq.path);
      },
      onProxyRes: (proxyRes) => {
        console.log("Proxy response status:", proxyRes.statusCode);
      },
    });
    console.log("Proxy executing...");
    proxy(req, res, (err) => {
      console.log("Proxy callback, error:", err || "none");
      if (err) {
        res.status(500).end();
      } else if (!res.headersSent) {
        console.log("No response sent, forcing 404");
        res.status(404).end();
      }
    });
  } catch (error) {
    console.error("Proxy setup error:", error.message);
    res.status(500).end();
  }
};
