import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { WebSocketMessage } from "@/types/WebSocketMessage";
import { SocketContentType } from "@/enums/SocketContentType";

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
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useRef<boolean>(false); // Lock to prevent multiple simultaneous connections
  const connectionIdRef = useRef<string>(''); // Unique ID to track current connection attempt

  const sendMessage = useCallback((message: string) => {
    if (socket && connected) {
      socket.send(message);
    } else {
      console.error("Cannot send message, socket not connected");
    }
  }, [socket, connected]);
  const connectWebSocket = useCallback(() => {
    if (!user || !user.id) return;
    
    // Prevent multiple connection attempts
    if (isConnecting.current) {
      console.log("Connection attempt already in progress, skipping");
      return;
    }
    
    isConnecting.current = true;
    const connectionId = Date.now().toString(); // Generate unique ID for this connection attempt
    connectionIdRef.current = connectionId;
    
    const token = localStorage.getItem('accessToken');
    console.log(`Starting new connection attempt (ID: ${connectionId})`);
    const wsInstance = new WebSocket(`${__WEB_SOCKET_URL__}/ws?access_token=${token}`);
      wsInstance.onopen = () => {
      // Only process if this is still the active connection attempt
      if (connectionIdRef.current !== connectionId) {
        console.log(`Ignoring open event for outdated connection ${connectionId}`);
        wsInstance.close(1000, "Superseded by newer connection");
        return;
      }
      
      console.log(`🔗 WebSocket connection established (ID: ${connectionId})`, {
        timestamp: new Date().toISOString(),
        readyState: wsInstance.readyState
      });
      
      isConnecting.current = false; // Release connection lock
      setConnected(true);
      reconnectAttempts.current = 0; // Reset counter on successful connection
        // Setup ping interval when connection is established
      pingIntervalRef.current = setInterval(() => {
        if (wsInstance.readyState === WebSocket.OPEN) {
          // Send a ping message
          wsInstance.send(JSON.stringify({ 
            type: SocketContentType.Ping,
            timestamp: new Date().toISOString()
          }));
          console.log("📤 Ping sent at", new Date().toISOString());
        }
      }, 30000); // Send ping every 30 seconds
    };
      wsInstance.onclose = (event) => {
      console.log(`❌ WebSocket connection closed (ID: ${connectionId})`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timestamp: new Date().toISOString()
      });
      
      // Only handle disconnection if this is the current active connection
      if (connectionIdRef.current !== connectionId) {
        console.log(`Ignoring close event for outdated connection ${connectionId}`);
        return;
      }
      
      setConnected(false);
      
      // Clean up resources
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      // Only attempt reconnection for abnormal closures
      // 1000 (Normal Closure) and 1001 (Going Away) are normal server closures
      // 1006 is abnormal closure (no close frame received)
      const shouldReconnect = (event.code !== 1000 && event.code !== 1001) || 
                             (event.code === 1000 && event.reason !== "Replaced by new connection" && 
                              event.reason !== "Client disconnecting" && 
                              event.reason !== "Component unmounting" &&
                              event.reason !== "Superseded by newer connection");
      
      // Release connection lock, so new attempts can happen
      isConnecting.current = false;
      
      if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`Attempting to reconnect in ${delay/1000} seconds... (Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (user && user.id) {
            reconnectAttempts.current += 1;
            connectWebSocket();
          }
        }, delay);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error("Max reconnection attempts reached. Please refresh the page.");
      } else {
        console.log("Clean disconnection, not attempting to reconnect.");
      }
    };
      wsInstance.onerror = (error) => {
      console.error(`⚠️ WebSocket error (ID: ${connectionId}):`, error);
      
      // Only process if this is the active connection
      if (connectionIdRef.current !== connectionId) {
        return;
      }
      
      setConnected(false);
      // The onclose handler will be called after onerror, 
      // so we don't need to handle reconnection here
    };wsInstance.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if it's a pong response to our ping
        if (data.type === SocketContentType.Pong) {
          console.log("📥 Pong received at", new Date().toISOString());
          return;
        }
        
        const message = data as WebSocketMessage;
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
      // Only clean up if this is the current connection
      if (connectionIdRef.current !== connectionId) {
        return;
      }
      
      // Clean up all resources
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Reset connection lock
      isConnecting.current = false;
      
      if (wsInstance) {
        // Attempt clean closure
        if (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING) {
          wsInstance.close(1000, "Client disconnecting");
        }
      }
    };}, [user]);
    // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      // This will be called when the component unmounts
      isConnecting.current = false; // Reset connection lock
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      if (socket) {
        socket.close(1000, "Component unmounting");
      }
    };
  }, [connectWebSocket, user]);

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