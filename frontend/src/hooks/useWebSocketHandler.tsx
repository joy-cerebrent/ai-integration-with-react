import { useEffect } from "react";
import { Activity } from "@/types/Activity";
import { WebSocketMessage } from "@/types/WebSocketMessage";
import { Message } from "@/types/Message";
import { MessageStatus } from "@/enums/MessageStatus";
import { SocketContentType } from "@/enums/SocketContentType";
import { ActivityType } from "@/enums/ActivityType";

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
        const socketMessage: WebSocketMessage = JSON.parse(event.data);

        let message = messages.find(
          (msg) =>
            msg &&
            msg.id &&
            msg.id === socketMessage?.requestCard?.conversationMessageId
        );
        if (!message) {
          message = messages.find((msg) => msg && !msg.id);
          if (!message) {
            console.error("Message not found for alert:", socketMessage);
            return;
          } else {
            message.id = socketMessage.requestCard.conversationMessageId;
          }
        }

        if (socketMessage.type === SocketContentType.Question) {
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
        } else if (socketMessage.type === SocketContentType.Activity) {
          const activity: Activity = socketMessage.content;
          if (!activity) {
            console.error("Activity content is null or undefined");
            return;
          }
          if (message?.activities === undefined) {
            message.activities = [];
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
          if (activity.activityType === ActivityType.Notification) {
            setIsThinking(false);
          }
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
