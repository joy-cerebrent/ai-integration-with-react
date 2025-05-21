import { Author } from "@/enums/Author"

export interface RequestCard {
    cardId: string;
    userId: string;
    sessionId?: string;
    conversationId?: string;
    conversationMessageId?: string;
    senderId: string;
    senderRole: Author;
    correlationId?: string;
}