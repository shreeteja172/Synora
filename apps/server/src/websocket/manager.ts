import { WebSocket } from "ws";

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

class WebSocketManager {
  private clients = new Map<string, AuthenticatedWebSocket>();

  connect(userId: string, ws: AuthenticatedWebSocket) {
    ws.userId = userId;
    this.clients.set(userId, ws);

    console.log(`${userId} connected`);
  }

  disconnect(userId: string) {
    this.clients.delete(userId);

    console.log(`${userId} disconnected`);
  }

  get(userId: string) {
    return this.clients.get(userId);
  }

  send(userId: string, data: unknown) {
    const client = this.clients.get(userId);

    if (!client) return;

    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  isOnline(userId: string) {
    return this.clients.has(userId);
  }
}

export const manager = new WebSocketManager();