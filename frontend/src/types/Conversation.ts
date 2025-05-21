import { Message } from "./Message"

export interface Conversation {
  id: string
  title: string
  userId: string
  createdAt: string
  updatedAt: string
  messages: Message[] 
}
