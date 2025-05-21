import { Author } from "@/enums/Author"
import { ContentType } from "@/enums/ContentType"
import { MessageType } from "@/enums/MessageType"
import { Activity } from "@/types/Activity"

export interface Message {
    id?: string | null
    conversationId?: string | null
    author: Author
    type: MessageType
    contentType: ContentType
    message: string
    content?: any
    timestamp: string
    activities: Activity[]
    sender: string
}
