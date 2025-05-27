import { ContentType } from "@/enums/ContentType"
import { MessageType } from "@/enums/MessageType"
import { Activity } from "@/types/Activity"
import { MessageStatus } from "@/enums/MessageStatus"
import { RequestCard } from "./RequestCard";
import { FormMetadata } from "@/components/DynamicForm";

export interface Message {
  id?: string | null;
  conversationId?: string | null;
  requestCard: RequestCard;
  text: string;
  // content?: Record<string, unknown> | null;
  content?: any | null;
  contentType: ContentType;
  metadata?: FormMetadata;
  type: MessageType;
  timestamp: string; // ISO string representation of DateTime
  messageStatus: MessageStatus;
  activities?: Activity[];
  sender: string;
}
