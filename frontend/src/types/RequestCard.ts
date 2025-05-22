import { Author } from "@/enums/Author"

export interface RequestCard {    
    userId: string;
    sessionId?: string;
    conversationId?: string;
    conversationMessageId?: string;
    senderId: string;
    senderRole: Author;
    receiverId?: string;
    receiverRole: Author;
    correlationId?: string;
}