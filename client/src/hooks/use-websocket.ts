import { useEffect, useRef, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

type WebSocketMessage = {
  type: 'projects_updated' | 'orders_updated' | 'settings_updated' | 'stats_updated';
  data?: any;
};

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('[WebSocket] Received:', message.type);

        switch (message.type) {
          case 'projects_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/admin/projects'] });
            queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
            break;
          case 'orders_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
            break;
          case 'settings_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
            break;
          case 'stats_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
            break;
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected, reconnecting in 3s...');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
}
