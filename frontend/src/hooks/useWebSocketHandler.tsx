import { useCallback } from "react";
import { Activity } from "@/types/Activity";
import { WebSocketMessage } from "@/types/WebSocketMessage";
import { Message } from "@/types/Message";
import { SocketContentType } from "@/enums/SocketContentType";
import { FormMetadata, FormMetadataField } from "@/components/DynamicForm";
import { ActivityType } from "@/enums/ActivityType";
import { ContentType } from "@/enums/ContentType";
import { useWebSocketMessages } from "@/context/SocketProvider";
import { MessageType } from "@/enums/MessageType";
import { MessageStatus } from "@/enums/MessageStatus";

const useWebSocketHandler = (
  _messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>
) => {  const handleSocketMessage = useCallback((socketMessage: WebSocketMessage) => {
    // Validate that the message is properly formed before processing
    if (!socketMessage) {
      console.error("Received invalid socket message:", socketMessage);
      return;
    }
    
    console.log("📨 Socket Message:", socketMessage);
      // Ignore ping/pong messages for message handling
    if (socketMessage.type === SocketContentType.Ping || socketMessage.type === SocketContentType.Pong) {
      console.log(`Received ${socketMessage.type === SocketContentType.Ping ? "ping" : "pong"} message, ignoring for UI updates`);
      return;
    }
    
    // For any non-ping/pong message, we should stop the thinking indicator
    // This ensures that any response, alert, activity, etc. turns off the indicator
    if (socketMessage.type !== SocketContentType.Question) {
      setIsThinking(false);
    }

    setMessages((prevMessages) => {
      // Try to find matching message by ID first
      let messageIndex = prevMessages.findIndex(
        (msg) => msg.id === socketMessage?.requestCard?.conversationMessageId
      );      // If no match by ID, try to find the most recent pending message
      if (messageIndex === -1 && socketMessage.type !== SocketContentType.Question) {
        // Find the most recent pending message that starts with "pending-"
        messageIndex = prevMessages.findIndex(
          (msg) => msg.id && msg.id.startsWith('pending-') && msg.messageStatus === MessageStatus.Pending
        );
      }// If still no match, this might be a new message
      if (socketMessage.type === SocketContentType.Question && socketMessage.content) {
        // Ensure content is a valid Message type
        const messageContent = socketMessage.content as unknown as Message;
        if (messageContent) {
          return [...prevMessages, messageContent];
        }
      }      if(socketMessage.type === SocketContentType.Response) {
        // Ensure content is a valid Message type
        const messageContent = socketMessage.content as unknown as Message;
        if (messageContent) {
          return [...prevMessages, messageContent];
        }
      }

      // If we still can't find a message to update, log error and return unchanged
      if (messageIndex === -1) {
        console.log("No matching message found for update. Message details:", {
          id: socketMessage.requestCard?.conversationMessageId,
          type: socketMessage.type,
          message: socketMessage.message
        });
        return prevMessages;
      }

      // Create a new messages array with the current message
      const updatedMessages = [...prevMessages];
      const currentMessage = { ...updatedMessages[messageIndex] };      // Update message ID if it's not set or if it's a pending message
      if ((currentMessage.id && currentMessage.id.startsWith('pending-') || !currentMessage.id) && 
          socketMessage.requestCard?.conversationMessageId) {
        currentMessage.id = socketMessage.requestCard.conversationMessageId;
      }

      // Handle different socket message types
      switch (socketMessage.type) {
        case SocketContentType.Question: {
          if (socketMessage.content && typeof socketMessage.content === 'object') {
            const content = socketMessage.content as Record<string, unknown>;
            const formData = validateFormMetadata(content);
            if (formData) {
              currentMessage.metadata = formData;
              currentMessage.type = MessageType.Question;
              currentMessage.contentType = ContentType.Json;
              currentMessage.content = socketMessage.content;
              // Force form re-render by adding a unique key
              currentMessage.timestamp = new Date().toISOString();
            }
          }
          if (socketMessage.message) {
            currentMessage.text = socketMessage.message;
          }
          currentMessage.messageStatus = MessageStatus.Pending;
          break;
        }

        case SocketContentType.Activity: {
          if (!socketMessage.content || typeof socketMessage.content !== 'object') {
            console.error("Invalid activity content received");
            return prevMessages;
          }

          const content = socketMessage.content as Record<string, unknown>;
          const activityData = validateActivityData(content);
          
          if (!activityData) {
            console.error("Invalid activity structure:", content);
            return prevMessages;
          }
          
          // Initialize or update activities array
          currentMessage.activities = Array.isArray(currentMessage.activities)
            ? [...currentMessage.activities, activityData]
            : [activityData];
          
          break;
        }

        case SocketContentType.Alert: {
          // Add the alert as an activity
          const alertActivity: Activity = {
            id: `alert-${Date.now()}`,
            messageId: currentMessage.id || '',
            message: socketMessage.message,
            content: socketMessage.content,
            contentType: ContentType.Text,
            activityType: ActivityType.Alert,
            timestamp: socketMessage.timestamp
          };

          currentMessage.activities = Array.isArray(currentMessage.activities)
            ? [...currentMessage.activities, alertActivity]
            : [alertActivity];
          break;
        }

        default: {
          console.warn("Unhandled socket message type:", socketMessage.type);
          break;
        }      }
      
      // Update the message in our messages array
      updatedMessages[messageIndex] = currentMessage;
      
      // Set completed status for the message if it's done processing
      if (socketMessage.type === SocketContentType.Response || 
          socketMessage.type === SocketContentType.Alert) {
        currentMessage.messageStatus = MessageStatus.Completed;
      }
      
      return updatedMessages;
    });
  }, [setMessages, setIsThinking]);

  // Subscribe to WebSocket messages
  useWebSocketMessages(handleSocketMessage);
};

// Type guard for field object
function isFormMetadataField(field: unknown): field is FormMetadataField {
  if (!field || typeof field !== 'object') return false;
  
  const f = field as Record<string, unknown>;
  return (
    typeof f.name === 'string' &&
    typeof f.label === 'string' &&
    typeof f.type === 'string' &&
    typeof f.isRequired === 'boolean' &&
    (f.placeholder === undefined || typeof f.placeholder === 'string') &&
    (f.options === undefined || (Array.isArray(f.options) && f.options.every(opt => typeof opt === 'string')))
  );
}

// Validate and transform form metadata
function validateFormMetadata(content: Record<string, unknown>): FormMetadata | null {
  if (
    typeof content.formTitle === 'string' &&
    Array.isArray(content.fields) &&
    content.fields.every(isFormMetadataField)
  ) {
    return {
      formTitle: content.formTitle,
      fields: content.fields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type,
        isRequired: field.isRequired,
        ...(field.placeholder && { placeholder: field.placeholder }),
        ...(field.options && { options: field.options })
      }))
    };
  }
  return null;
}

// Validate and transform activity data
function validateActivityData(content: Record<string, unknown>): Activity | null {
  if (
    typeof content.id === 'string' &&
    typeof content.messageId === 'string' &&
    typeof content.message === 'string' &&
    typeof content.activityType === 'number' &&
    Object.values(ActivityType).includes(content.activityType as ActivityType) &&
    typeof content.timestamp === 'string' &&
    (content.content === undefined || content.content === null || typeof content.content === 'object') &&
    (content.contentType === undefined || content.contentType === null || 
      (typeof content.contentType === 'number' && Object.values(ContentType).includes(content.contentType as ContentType)))
  ) {
    return {
      id: content.id,
      messageId: content.messageId,
      message: content.message,
      activityType: content.activityType as ActivityType,
      timestamp: content.timestamp,
      content: (content.content as Record<string, unknown> | null) || null,
      contentType: content.contentType as ContentType | null || null
    };
  }
  return null;
}

export default useWebSocketHandler;
