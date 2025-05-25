import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { WebSocketMessage } from "@/types/WebSocketMessage";

interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
  connected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  sendMessage: () => {},
  connected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const sendMessage = useCallback((message: string) => {
    if (socket && connected) {
      socket.send(message);
    } else {
      console.error("Cannot send message, socket not connected");
    }
  }, [socket, connected]);

  useEffect(() => {
    if (!user || !user.id) return;
    
    const token = localStorage.getItem('accessToken');
    const wsInstance = new WebSocket(`${__WEB_SOCKET_URL__}/ws?access_token=${token}`);
    
    wsInstance.onopen = () => {
      console.log("🔗 WebSocket connection established");
      setConnected(true);
    };
    
    wsInstance.onclose = (event) => {
      console.log("❌ WebSocket connection closed", event);
      setConnected(false);
    };
    
    wsInstance.onerror = (error) => {
      console.error("⚠️ WebSocket error:", error);
      setConnected(false);
    };
    
    wsInstance.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        // Forward the parsed message directly to any listeners
        const customEvent = new CustomEvent('websocketMessage', { 
          detail: message 
        });
        window.dispatchEvent(customEvent);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    setSocket(wsInstance);

    return () => {
      if (wsInstance) {
        wsInstance.close();
      }
    };
  }, [user]);

  const contextValue = {
    socket,
    sendMessage,
    connected,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

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