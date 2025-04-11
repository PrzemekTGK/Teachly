import { WebSocketServer } from "ws";

export function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server });
  const clients = new Map();

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.streamKey) {
          clients.set(data.streamKey, ws);
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
