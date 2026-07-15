'use client';

import { useEffect, useRef } from 'react';
import { Order } from '../types/order';

interface UseLiveOrdersOptions {
  onOrderCreated?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onOrderDeleted?: (id: string) => void;
  onConnectionStateChange?: (isConnected: boolean) => void;
}

export const useLiveOrders = ({
  onOrderCreated,
  onOrderUpdated,
  onOrderDeleted,
  onConnectionStateChange,
}: UseLiveOrdersOptions = {}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef({
    onOrderCreated,
    onOrderUpdated,
    onOrderDeleted,
    onConnectionStateChange,
  });

  useEffect(() => {
    callbacksRef.current = {
      onOrderCreated,
      onOrderUpdated,
      onOrderDeleted,
      onConnectionStateChange,
    };
  }, [onOrderCreated, onOrderUpdated, onOrderDeleted, onConnectionStateChange]);

  useEffect(() => {
    let reconnectTimer: number | null = null;
    let mounted = true;

    const connectSocket = () => {
      if (!mounted) {
        return;
      }

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000');
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        callbacksRef.current.onConnectionStateChange?.(true);
      });

      socket.addEventListener('close', () => {
        callbacksRef.current.onConnectionStateChange?.(false);
        if (!mounted) {
          return;
        }

        if (socketRef.current === socket) {
          reconnectTimer = window.setTimeout(connectSocket, 2000);
        }
      });

      socket.addEventListener('error', () => {
        callbacksRef.current.onConnectionStateChange?.(false);
      });

      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data as string);

          if (data.event === 'order:created' && data.payload?.order) {
            callbacksRef.current.onOrderCreated?.(data.payload.order as Order);
          }

          if (data.event === 'order:updated' && data.payload?.order) {
            callbacksRef.current.onOrderUpdated?.(data.payload.order as Order);
          }

          if (data.event === 'order:deleted' && data.payload?.id) {
            callbacksRef.current.onOrderDeleted?.(data.payload.id as string);
          }
        } catch (error) {
          console.error('Live orders websocket error:', error);
        }
      });
    };

    connectSocket();

    return () => {
      mounted = false;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);
};
