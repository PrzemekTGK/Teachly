import { WebSocketServer } from "ws";

export function initializeWebSocket(server) {
  console.log("Creating WebSocket Server!");
  const wss = new WebSocketServer({ server });
  console.log("WebSocket server created");
  const clients = new Map();

  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.streamKey) {
          clients.set(data.streamKey, ws);
          console.log(`Registered ${data.streamKey}, clients: ${clients.size}`);
          console.log(`CLIENTS: `, clients);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      for (const [streamKey, client] of clients) {
        if (client === ws) clients.delete(streamKey);
      }
    });

    ws.on("error", (error) => console.error("WebSocket error:", error));
  });

  return clients;
}
