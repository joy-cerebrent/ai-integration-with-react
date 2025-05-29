import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import ChatTitle from "@/components/ChatTitle";
import ChatForm from "@/components/ChatForm";
import MessageItem from "@/components/MessageItem";

import { useTitle } from "@/hooks/useTitle";
import useWebSocketHandler from "@/hooks/useWebSocketHandler";
import { useAuth } from "@/context/AuthContext";

import { MessageSchema, type MessageSchemaType } from "@/validators/ConversationSchema";
import { Author } from "@/enums/Author";
import { ContentType } from "@/enums/ContentType";
import { MessageType } from "@/enums/MessageType";
import { MessageStatus } from "@/enums/MessageStatus";
import type { RequestCard } from "@/types/RequestCard";
import type { Message } from "@/types/Message";

import { fetchConversation, sendMessage } from "@/api/conversationApi";

const Chat = () => {  const { id } = useParams();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (bottomRef.current) {
      const behavior = messages.length <= 1 ? 'auto' : 'smooth';
      bottomRef.current.scrollIntoView({ behavior });
    }
  }, [messages, isThinking]);

  const {
    reset,
    setValue,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<MessageSchemaType>({
    resolver: zodResolver(MessageSchema),
  });

  useTitle(title);

  const { isLoading, isError: queryError } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      if (!id) throw new Error("No conversation ID provided");
      const data = await fetchConversation(id);
      setTitle(data.title || "Conversation");
      setMessages(data.messages || []);
      return data;
    },
    enabled: !!id,
  });

  useWebSocketHandler(messages, setMessages, setIsThinking);

  const onSubmit = async (data: MessageSchemaType) => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }

    if (!id) {
      toast.error("No conversation ID");
      return;
    }

    const requestCard: RequestCard = {      
      conversationId: id,
      senderRole: Author.User,
      senderId: user.id,
      userId: user.id,      
      receiverRole: Author.System,
    };    const userMessage: Message = {
      id: `pending-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId: id,
      type: MessageType.Prompt,
      contentType: ContentType.Text,
      text: data.prompt,
      content: null,
      timestamp: new Date().toISOString(),
      requestCard: requestCard,
      sender: "user",
      activities: [],
      messageStatus: MessageStatus.Pending,
    };

    setMessages(prev => [...prev, userMessage]);
    reset();
    setIsThinking(true);

    try {
      const responseData = await sendMessage(userMessage);
      if (responseData.status === "error") {
        toast.error(responseData.message || "Error sending message");
        setIsThinking(false);
      } else if (responseData.status) {
        toast.success(responseData.message || "Message sent");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsThinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse">Loading conversation...</div>
      </div>
    );
  }

  if (queryError && error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col p-6 pt-24 w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <ChatTitle id={id!} title={title} />

      <div className="flex-1 overflow-y-auto rounded space-y-4 mb-6 pr-1.5">      {messages.map((msg, index) => (
          <MessageItem 
            key={msg.id ? `msg-${msg.id}` : `msg-${msg.timestamp}-${index}`} 
            msg={msg} 
          />
        ))}

        {isThinking && (
          <span className="inline-flex items-end gap-2 bg-neutral-800 self-start px-5 py-1.5 rounded text-white animate-pulse">
            AI is Thinking
            <span className="size-1 bg-white rounded-full mb-1.5 animate-bounce" />
            <span className="size-1 bg-white rounded-full mb-1.5 animate-bounce delay-150" />
            <span className="size-1 bg-white rounded-full mb-1.5 animate-bounce delay-300" />
          </span>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        setValue={setValue}
        errors={formErrors}
      />
    </div>
  );
};

export default Chat;
