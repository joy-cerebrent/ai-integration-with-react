import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import ChatTitle from "@/components/ChatTitle";

import { useTitle } from "@/hooks/useTitle";
import {
  MessageSchema,
  type MessageSchemaType,
} from "@/validators/ConversationSchema";
import { useSocket } from "@/context/SocketProvider";
import { Author } from "@/enums/Author";
import { ContentType } from "@/enums/ContentType";
import { MessageType } from "@/enums/MessageType";
import { RequestCard } from "@/types/RequestCard";
import { Message } from "@/types/Message";
import { toast } from "sonner";
import { fetchConversation, sendMessage } from "@/api/conversationApi";
import useWebSocketHandler from "@/hooks/useWebSocketHandler";
import MessageItem from "@/components/MessageItem";
import ChatForm from "@/components/ChatForm";
import { useAuth } from "@/context/AuthContext";
import { MessageStatus } from "@/enums/MessageStatus";

const Chat = () => {
  const { socket, connected } = useSocket();
  const { id } = useParams();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MessageSchemaType>({
    resolver: zodResolver(MessageSchema),
  });

  useTitle(title);

  const { isLoading, isError } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const data = await fetchConversation(id);
      setTitle(data.title || "Conversation");
      setMessages(data.messages || []);
      return data;
    },
  });

  useWebSocketHandler(socket, connected, messages, setMessages, setIsThinking);

  const onSubmit = async (data: MessageSchemaType) => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }

    const requestCard: RequestCard = {      
      conversationId: id,
      senderRole: Author.User,
      senderId: user.id,
      userId: user.id,      
      receiverRole: Author.System, // Assuming the receiver is the system
    };

    const userMessage: Message = {
      conversationId: id,
      type: MessageType.Prompt, // Updated to use `MessageType.Prompt`
      contentType: ContentType.Text,
      text: data.prompt,
      content: null,
      timestamp: new Date().toISOString(),
      requestCard: requestCard,
      sender: "user",
      activities: [],
      messageStatus: MessageStatus.Pending,
    };

    setMessages((prev) => [...prev, userMessage]);
    reset();

    setIsThinking(true);

    try {
      const responseData = await sendMessage(userMessage);
      if (responseData.status === "error") {
        toast.error(responseData.message);
      } else if (responseData.status) {
        toast.success(responseData.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      // setIsThinking(false)
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError && error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen flex-col p-6 pt-24 w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <ChatTitle id={id!} title={title} />

      <ul className="flex-1 overflow-y-auto rounded space-y-4 mb-6 pr-1.5">
        {messages.map((msg) => (
          <MessageItem key={msg.id} msg={msg} />
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
      </ul>

      <ChatForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        setValue={setValue}
        errors={errors}
      />
    </div>
  );
};

export default Chat;
