import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  MessageSchema,
  MessageSchemaType,
} from "@/validators/ConversationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/context/SocketProvider";

// Enum definitions from the OpenAPI spec
enum Author {
  System = 1,
  User = 2,
  Assistant = 3,
}

enum ContentType {
  Text = 0,
  Image = 1,
  File = 2,
  Code = 3,
  Audio = 4,
  Video = 5,
}

enum MessageType {
  Message = 0,
  SystemMessage = 1,
  Error = 2,
  Loading = 3,
  Input = 4,
}

interface SocketResponse {
  type: string;
  status: "error" | "success" | "info";
  message: string;
  data: {
    taskId?: string;
    conversationId?: string;
    conversationMessageId?: string;
    eventType?: string;
    timestamp: string;
    result?: string;
    rawResult?: string;
    questionId?: string;
    question?: string;
  };
}

const API_URL = "http://localhost:5109"; // Update to your actual base URL

const Chat = () => {
  const [processingMessageIds, setProcessingMessageIds] = useState<Set<string>>(
    new Set()
  );
  const { socket, sendMessage, connected } = useSocket();

  const { id } = useParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingQuestions, setPendingQuestions] = useState<Record<string, any>>(
    {}
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MessageSchemaType>({
    resolver: zodResolver(MessageSchema),
  });

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/Task/conversation/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();

      // Update based on actual response structure
      setTitle(data.title || "Conversation");
      setMessages(data.messages || []);
      setError(null);
      console.log("fetched conversation....", data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !connected) return;

    // Handle WebSocket messages
    const handleSocketMessage = (event: MessageEvent) => {
      try {
        const response: SocketResponse = JSON.parse(event.data);
        console.log("📨 Socket Message:", response);

        // If the message is related to our current conversation
        if (response.data.conversationId === id) {
          switch (response.type) {
            case "task_completed":
              // The AI has completed processing a message
              if (response.status === "success" && response.data.result) {
                // Update the message with the result
                setMessages((prev) => {
                  const updatedMessages = [...prev];
                  // Find the loading message and replace it with the result
                  const index = updatedMessages.findIndex(
                    (msg) => msg._id === response.data.conversationMessageId
                  );

                  if (index !== -1) {
                    updatedMessages[index] = {
                      ...updatedMessages[index],
                      content: response.data.result,
                      isLoading: false,
                    };
                  } else {
                    // If we can't find the message, add the response as a new message
                    updatedMessages.push({
                      _id:
                        response.data.conversationMessageId ||
                        Date.now().toString(),
                      content: response.data.result,
                      sender: "ai",
                      isLoading: false,
                    });
                  }
                  return updatedMessages;
                });

                // Remove from processing list
                setProcessingMessageIds((prev) => {
                  const updated = new Set(prev);
                  if (response.data.conversationMessageId) {
                    updated.delete(response.data.conversationMessageId);
                  }
                  return updated;
                });

                setIsThinking(false);
              }
              break;

            case "task_error":
              // Handle error responses
              // Instead of setting the error state which triggers the error UI,
              // display the error in the conversation as an AI message
              setMessages((prev) => {
                const updatedMessages = [...prev];
                // Find the loading message and replace it with the error
                const index = updatedMessages.findIndex(
                  (msg) => msg._id === response.data.conversationMessageId
                );

                if (index !== -1) {
                  updatedMessages[index] = {
                    ...updatedMessages[index],
                    content: `Error: ${response.message}`,
                    isLoading: false,
                    isError: true,
                  };
                } else {
                  // If we can't find the message, add the error as a new message
                  updatedMessages.push({
                    _id:
                      response.data.conversationMessageId ||
                      Date.now().toString(),
                    content: `Error: ${response.message}`,
                    sender: "ai",
                    isLoading: false,
                    isError: true,
                  });
                }
                return updatedMessages;
              });

              // Remove from processing list
              setProcessingMessageIds((prev) => {
                const updated = new Set(prev);
                if (response.data.conversationMessageId) {
                  updated.delete(response.data.conversationMessageId);
                }
                return updated;
              });

              setIsThinking(false);
              // We set a temporary error message that will fade away
              setError(response.message || "An error occurred");
              setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
              break;

            case "task_progress":
              // Handle progress updates - could update a progress indicator
              console.log("Progress update:", response.message);
              break;

            case "task_question":
              // Handle questions from the agent that need user input
              console.log("Question from agent:", response.message);

              // Store the question ID for when we need to respond
              if (response.data.questionId) {
                setPendingQuestions((prev) => ({
                  ...prev,
                  [response.data.questionId]: {
                    question: response.message,
                    taskId: response.data.taskId,
                  },
                }));

                // Add the question as a message
                setMessages((prev) => [
                  ...prev,
                  {
                    _id: response.data.questionId || Date.now().toString(),
                    content: response.message,
                    sender: "ai",
                    isQuestion: true,
                    questionId: response.data.questionId,
                  },
                ]);
              }
              break;

            case "task_notification":
              // General notifications - could display in a toast
              console.log("🔔 Notification:", response.message);
              break;
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    // Add event listener to the WebSocket
    socket.addEventListener("message", handleSocketMessage);

    // Clean up when component unmounts
    return () => {
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket, connected, id]);

  // Handle submitting an answer to a question from the agent
  const submitAnswer = async (questionId: string, answer: string) => {
    if (!pendingQuestions[questionId]) return;

    const token = localStorage.getItem("accessToken");
    try {
      // Add the answer as a user message
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          content: answer,
          sender: "user",
        },
      ]);

      // Send the answer via API
      const response = await fetch(`${API_URL}/api/Task/input`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: pendingQuestions[questionId].taskId,
          userId: localStorage.getItem("userId"), // Make sure this is available
          input: answer,
          questionId: questionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send answer");
      }

      // Remove from pending questions
      setPendingQuestions((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Modify onSubmit to track the message being processed
  const onSubmit = async (data: MessageSchemaType) => {
    const token = localStorage.getItem("accessToken");
    const messageId = Date.now().toString(); // Generate a client-side ID

    // Create a message object in the format the API expects
    const userMessage = {
      conversationId: id,
      author: Author.User,
      type: MessageType.Message,
      contentType: ContentType.Text,
      message: data.prompt,
      timestamp: new Date().toISOString(),
      id: messageId, // Include the ID so we can track it
    };

    // Add message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        _id: messageId,
        content: data.prompt,
        sender: "user",
      },
    ]);

    reset();
    setIsThinking(true);

    // Add to processing list
    setProcessingMessageIds((prev) => new Set(prev).add(messageId));

    try {
      // Send message to the API
      const response = await fetch(`${API_URL}/api/Task/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userMessage),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Add an initial loading state for AI response
      // The WebSocket will update this when processing completes
      setMessages((prev) => [
        ...prev,
        {
          _id: `${messageId}-response`,
          content: "Processing your request...",
          sender: "ai",
          isLoading: true,
        },
      ]);

      // Don't need to manually set isThinking to false
      // The socket listener will handle the response
    } catch (err: any) {
      setIsThinking(false);
      setError(err.message);

      // Remove from processing list if there's an error
      setProcessingMessageIds((prev) => {
        const updated = new Set(prev);
        updated.delete(messageId);
        return updated;
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Handle answering a question from the agent
  const handleQuestionSubmit = (questionId: string) => (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const inputElement = formElement.elements.namedItem(
      "answer"
    ) as HTMLInputElement;

    if (inputElement && inputElement.value) {
      submitAnswer(questionId, inputElement.value);
      inputElement.value = "";
    }
  };

  return (
    <div className="flex h-screen flex-col p-6 pt-24 w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <h1 className="text-2xl font-semibold pb-2 mb-4 border-b-[1px]">
        {title}
      </h1>

      <ul className="flex-1 overflow-y-auto rounded space-y-4 mb-6">
        {messages.map((msg, index) => (
          <li
            key={msg._id || index}
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
                {msg.content?.result || msg.content || msg.message}
              </>
            ) : (
              <>
                <strong>Gemini:</strong>
                <ReactMarkdown
                  components={{
                    code({ className, children, ...rest }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          PreTag="div"
                          language={match[1]}
                          // @ts-ignore
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
                  }}
                >
                  {msg.content?.result || msg.content || msg.message || ""}
                </ReactMarkdown>

                {/* Add question input form if this is a question message */}
                {msg.isQuestion && msg.questionId && (
                  <form
                    onSubmit={handleQuestionSubmit(msg.questionId)}
                    className="mt-2 flex gap-2"
                  >
                    <Input
                      name="answer"
                      placeholder="Type your answer..."
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      Answer
                    </Button>
                  </form>
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
          <Input
            type="text"
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
