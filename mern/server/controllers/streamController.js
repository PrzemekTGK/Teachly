// server/controllers/streamController.js
import { createProxyMiddleware } from "http-proxy-middleware";

export const streamProxy = async (req, res, next) => {
  console.log("Stream proxy started for request:", req.url);

  const proxy = createProxyMiddleware({
    target: "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
    changeOrigin: true,
    pathRewrite: {
      "^/api/stream/hls": "/hls",
    },
    onError: (err, req, res) => {
      console.error("Proxy error occurred:", err.message, err.stack);
      res.status(500).send("Proxy failed");
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log("Proxy request sent to target:", proxyReq.path);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(
        "Proxy response received from target, status:",
        proxyRes.statusCode
      );
      if (req.url.endsWith(".m3u8")) {
        let body = "";
        proxyRes.on("data", (chunk) => {
          body += chunk.toString();
          console.log("Received chunk of manifest data:", chunk.toString());
        });
        proxyRes.on("end", () => {
          console.log("Original manifest body:", body);
          const rewrittenBody = body.replace(
            /http:\/\/ec2-51-21-152-36\.eu-north-1\.compute\.amazonaws\.com\/hls/g,
            `https://${req.headers.host}/api/stream/hls`
          );
          console.log("Rewritten manifest body:", rewrittenBody);
          res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
          res.setHeader("Content-Length", Buffer.byteLength(rewrittenBody));
          res.end(rewrittenBody);
          console.log("Rewritten manifest sent to client");
        });
        // Prevent default streaming
        proxyRes.pipe = () => proxyRes;
      } else {
        console.log("Non-.m3u8 response, passing through");
      }
    },
  });

  try {
    console.log("Invoking proxy middleware");
    proxy(req, res, next);
  } catch (error) {
    console.error(
      "Error invoking proxy middleware:",
      error.message,
      error.stack
    );
    next(error);
  }
};
