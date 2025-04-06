import { createProxyMiddleware } from "http-proxy-middleware";

export const streamProxy = createProxyMiddleware({
  target: "http://ec2-51-21-152-36.eu-north-1.compute.amazonaws.com/hls",
  changeOrigin: true,
  pathRewrite: {
    "^/api/stream": "", // Remove '/api/stream' from the proxied URL
  },
});
