import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery } from "@tanstack/react-query";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { zodResolver } from "@hookform/resolvers/zod";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatTitle from "@/components/ChatTitle";

import { cn } from "@/lib/utils";
import { useTitle } from "@/hooks/useTitle";
import {
  MessageSchema,
  type MessageSchemaType,
} from "@/validators/ConversationSchema";
import FormComponent from "@/components/FormComponent";
import { useSocket } from "@/context/SocketProvider";
import { Author } from "@/enums/Author";
import { ContentType } from "@/enums/ContentType";
import { MessageType } from "@/enums/MessageType";
import { MessageStatus } from "@/enums/MessageStatus";
import { Message } from "@/types/Message";
import { Conversation } from "@/types/Conversation";
import { toast } from "sonner";

const API_URL = __API_BASE_URL__;

const Chat = () => {
  const { socket, connected } = useSocket();
  const { id } = useParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/process/conversation/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data: Conversation = await res.json();
      setTitle(data.title || "Conversation");
      setMessages(data.messages || []);

      return data;
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleSocketMessage = (event: MessageEvent) => {
      try {
        console.log("📨 Raw Socket Message:", event.data);
        const response: Message = JSON.parse(event.data);
        console.log("📨 Socket Message:", response);
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages.push({
            id: response.id || Date.now().toString(),
            message: response.message,
            content: response.content,
            contentType: response.contentType,
            type: response.type,
            timestamp: response.timestamp,
            status: response.status,
            author: response.author,
            sender: response.sender,
          });
          if (response.status === MessageStatus.Completed) {
            setIsThinking(false);
          }
          return updatedMessages;
        });
        setIsThinking(false);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket, connected]);

  const onSubmit = async (data: MessageSchemaType) => {
    const userMessage: Message = {
      conversationId: id,
      type: MessageType.Chat,
      contentType: ContentType.Text,
      message: data.prompt,
      content: null,
      timestamp: new Date().toISOString(),
      status: MessageStatus.Pending,
      author: Author.User,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    reset();

    const token = localStorage.getItem("accessToken");
    setIsThinking(true);

    try {
      const response = await fetch(`${API_URL}/api/Process/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userMessage),
      });
      const responseData = await response.json();
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
          <li
            key={msg.id}
            className={cn("w-fit max-w-[75%] px-4 py-2.5 rounded shadow", {
              "bg-neutral-100 dark:bg-neutral-950 border border-transparent dark:border-neutral-600 ml-auto text-right text-neutral-900 dark:text-white":
                msg.sender === "user",
              "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-transparent mr-auto text-left text-neutral-900 dark:text-white":
                msg.sender === "ai",
            })}
          >
            {msg.sender === "user" ? (
              <>
                <strong>You:</strong>{" "}
                {typeof msg.content === "string"
                  ? msg.content
                  : JSON.stringify(msg.content)}
              </>
            ) : (
              <>
                <strong>{msg.sender}:</strong>
                {msg.type === MessageType.Form ? (
                  <FormComponent />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ className, children, ...rest }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <SyntaxHighlighter
                            PreTag="div"
                            language={match[1]}
                            // @ts-expect-error React component type mismatch
                            style={atomDark}
                            {...rest}
                          >
                            {String(children).trim()}
                          </SyntaxHighlighter>
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        );
                      },
                      table: ({ children }) => (
                        <table className="w-full border my-4 border-neutral-300 dark:border-neutral-700 text-sm">
                          {children}
                        </table>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-neutral-200 dark:bg-neutral-800">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="bg-white dark:bg-neutral-900">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="border-b border-neutral-300 dark:border-neutral-700">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-200">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-2 text-neutral-600 dark:text-neutral-300">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {typeof msg.content === "string"
                      ? msg.content
                      : msg.message || ""}
                  </ReactMarkdown>
                )}
              </>
            )}
          </li>
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col sm:flex-row items-center gap-4 mt-auto"
      >
        <div className="w-[40%]">
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setValue("file", e.target.files?.[0])}
            disabled={isSubmitting}
          />
          {errors.file && (
            <p className="text-sm text-red-500 mt-1">{errors.file.message}</p>
          )}
        </div>

        <div className="w-full">
          <Textarea
            placeholder="Type your message..."
            {...register("prompt")}
            disabled={isSubmitting}
          />
          {errors.prompt && (
            <p className="text-sm text-red-500 mt-1">{errors.prompt.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
};

export default Chat;
