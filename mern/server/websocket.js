// Import WebSocketServer class from the 'ws' library
import { WebSocketServer } from "ws";

// Export a function to initialize WebSocket server and manage clients
export function initializeWebSocket(server) {
  // Create a new WebSocket server instance, attaching it to the provided HTTP server
  const wss = new WebSocketServer({ server });

  // Initialize a Map to store WebSocket clients, keyed by streamKey
  const clients = new Map();

  // Handle new WebSocket connections
  wss.on("connection", (ws) => {
    // Handle incoming messages from a connected client
    ws.on("message", (message) => {
      try {
        // Parse the incoming message (expected to be JSON) into an object
        const data = JSON.parse(message.toString());

        // If the message contains a streamKey, associate the WebSocket client with that key
        if (data.streamKey) {
          clients.set(data.streamKey, ws);
        }
      } catch (error) {
        // Log any errors that occur during message parsing or processing
        console.error("WebSocket message error:", error);
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      // Iterate through the clients Map to find and remove the disconnected client
      for (const [streamKey, client] of clients) {
        if (client === ws) clients.delete(streamKey);
      }
    });

    // Handle WebSocket errors for this client
    ws.on("error", (error) => console.error("WebSocket error:", error));
  });

  // Return the clients Map for use in other parts of the application
  return clients;
}
