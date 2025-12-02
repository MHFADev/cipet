import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

let wss: WebSocketServer;

export type WebSocketMessage = {
  type: 'projects_updated' | 'orders_updated' | 'settings_updated' | 'stats_updated';
  data?: any;
};

export function setupWebSocket(httpServer: Server) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });
  });

  console.log('[WebSocket] Server initialized');
  return wss;
}

export function broadcast(message: WebSocketMessage) {
  if (!wss) return;

  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export function broadcastProjectsUpdate() {
  broadcast({ type: 'projects_updated' });
}

export function broadcastOrdersUpdate() {
  broadcast({ type: 'orders_updated' });
}

export function broadcastSettingsUpdate() {
  broadcast({ type: 'settings_updated' });
}

export function broadcastStatsUpdate() {
  broadcast({ type: 'stats_updated' });
}
