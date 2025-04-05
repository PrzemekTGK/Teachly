import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // ensure the build output is set to the 'dist' folder
    rollupOptions: {
      input: "/src/main.jsx", // Ensure this is pointing to your entry file (usually main.js or index.js)
    },
  },
  server: {
    // Disable the default localhost binding, allowing the server to be exposed externally
    host: true,
    port: 5173, // You can change this if needed
    strictPort: true,
    open: false, // You can set this to true if you want to automatically open the browser on start
  },
});
