import { useEffect } from "react";
import { Activity } from "@/types/Activity";
import { Message } from "@/types/Message";
import { MessageStatus } from "@/enums/MessageStatus";

const useWebSocketHandler = (
  socket: WebSocket | null,
  connected: boolean,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>
) => {
  useEffect(() => {
    if (!socket || !connected) return;

    const handleSocketMessage = (event: MessageEvent) => {
      try {
        console.log("📨 Raw Socket Message:", event.data);
        const activity: Activity = JSON.parse(event.data);
        let message = messages.find(
          (msg) =>
            msg &&
            msg.id &&
            msg.id === activity?.requestCard?.conversationMessageId
        );
        if (!message) {
          message = messages.find((msg) => msg && !msg.id);
          if (!message) {
            console.error("Message not found for activity:", activity);
            return;
          } else {
            message.id = activity.requestCard.conversationMessageId;
          }
        }

        
        message?.activities.push(activity);        
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(
            (msg) => msg.id === message?.id
          );
          if (index !== -1) {
            updatedMessages[index] = {
              ...updatedMessages[index],
              activities: message?.activities,
            };
          }           
          return updatedMessages;
        });
        if (activity.messageStatus === MessageStatus.Completed) {
          setIsThinking(false);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket, connected, messages, setMessages, setIsThinking]);
};

export default useWebSocketHandler;
