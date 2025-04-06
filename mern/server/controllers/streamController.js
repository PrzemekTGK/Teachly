import { createProxyMiddleware } from "http-proxy-middleware";

export const streamProxy = async (req, res, next) => {
  console.log("Stream proxy triggered for:", req.url);
  const proxy = createProxyMiddleware({
    target: "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com",
    changeOrigin: true,
    pathRewrite: {
      "^/api/stream/hls": "/hls",
    },
    onProxyRes: (proxyRes, req, res) => {
      if (req.url.endsWith(".m3u8")) {
        let body = "";
        proxyRes.on("data", (chunk) => (body += chunk));
        proxyRes.on("end", () => {
          const rewritten = body.replace(
            /http:\/\/ec2-51-21-152-36\.eu-north-1\.compute\.amazonaws\.com\/hls/g,
            `https://${req.headers.host}/api/stream/hls`
          );
          res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
          res.end(rewritten);
        });
      }
    },
  });
  proxy(req, res, next);
};
