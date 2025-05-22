import { RequestCard } from "./RequestCard";
// Removed unused `ContentType` import.
// Fixed the import path for `SocketContentType` to reference the newly created enum.
import { SocketContentType } from "../enums/SocketContentType";

export interface WebSocketMessage {
  requestCard: RequestCard;
  message: string;
  content?: Record<string, unknown> | null;
  type: SocketContentType;
  timestamp: string; // ISO string representation of DateTime
}
