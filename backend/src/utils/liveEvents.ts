import { WebSocketServer, WebSocket } from 'ws';

export type OrderEventName = 'order:created' | 'order:updated' | 'order:deleted';

let socketServer: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export const setSocketServer = (server: WebSocketServer) => {
  socketServer = server;

  server.on('connection', (socket) => {
    clients.add(socket);

    socket.on('close', () => {
      clients.delete(socket);
    });
  });
};

export const broadcastOrderEvent = (event: OrderEventName, payload: Record<string, unknown>) => {
  if (!socketServer) {
    return;
  }

  const message = JSON.stringify({ event, payload });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};
