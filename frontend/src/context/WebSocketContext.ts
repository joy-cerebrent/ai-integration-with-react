import { createContext } from "react";
import { WebSocketMessage } from "@/types/WebSocketMessage";

export interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
  connected: boolean;
  messages: WebSocketMessage[];
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  sendMessage: () => {},
  connected: false,
  messages: []
});
