import { useContext, useEffect } from 'react';
import { WebSocketContext } from '@/context/SocketProvider';
import { WebSocketMessage } from '@/types/WebSocketMessage';

export const useSocket = () => useContext(WebSocketContext);

// Helper hook to subscribe to WebSocket messages
export const useWebSocketMessages = (
  callback: (message: WebSocketMessage) => void
) => {
  useEffect(() => {
    const handleWebSocketMessage = (event: Event) => {
      const customEvent = event as CustomEvent<WebSocketMessage>;
      callback(customEvent.detail);
    };

    window.addEventListener('websocketMessage', handleWebSocketMessage);

    return () => {
      window.removeEventListener('websocketMessage', handleWebSocketMessage);
    };
  }, [callback]);
};
