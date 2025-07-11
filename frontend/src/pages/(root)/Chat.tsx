import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQuery } from '@tanstack/react-query';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { zodResolver } from '@hookform/resolvers/zod';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatTitle from '@/components/ChatTitle';

import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/useTitle';
import {
  MessageSchema,
  type MessageSchemaType
} from '@/validators/ConversationSchema';
import FormComponent from '@/components/FormComponent';
import ChartComponent from '@/components/ChartComponent';
import AccordionComponent from '@/components/AccordionComponent';
import SpreadSheetComponent from '@/components/spreadsheet/SpreadSheetSample';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';


const Chat = () => {
  const { id } = useParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [title, setTitle] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

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

  const { isLoading, isError, error } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/messages/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await res.json();

      setTitle(data.title);
      setMessages(data.messages);

      return data;
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data: MessageSchemaType) => {
    const userMessage = {
      conversationId: id,
      content: data.prompt,
      sender: "user"
    };

    setMessages((prev) => [...prev, userMessage]);

    reset();

    const token = localStorage.getItem("accessToken");

    setIsThinking(true);

    await fetch("http://localhost:3000/api/messages/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userMessage),
    });

    const aiResponse = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: data.prompt }),
    });

    const aiContent = await aiResponse.json();

    setIsThinking(false);

    const words = aiContent.split(" ");

    let aiMessageContent = "";
    let index = 0;

    const aiMessage = {
      conversationId: id,
      content: aiMessageContent,
      sender: "ai",
    };

    setMessages((prev) => [...prev, aiMessage]);

    const addWord = () => {
      if (index < words.length) {
        aiMessageContent += `${words[index]} `;
        index++;

        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            content: aiMessageContent.trim(),
          };
          return updatedMessages;
        });

        setTimeout(addWord, 50);
      } else {

        fetch("http://localhost:3000/api/messages/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId: id,
            content: aiMessageContent.trim(),
            sender: "ai"
          }),
        });
      }
    };

    addWord();
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.toString()}</div>;

  return (
    <div className="flex h-screen flex-col p-6 pt-24 w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-auto">
      <ChatTitle
        id={id!}
        title={title}
      />

      <ul className="flex-1 overflow-y-auto rounded space-y-4 mb-6 pr-1.5">
        {messages.map((msg, idx) => (
          <li>
            {msg.sender === "user" && idx > 0 && <Separator className="mt-10 mb-6" />}
            <p
              className={cn(
                "w-full font-medium mb-2",
                {
                  "self-end text-right": msg.sender === "user",
                  "self-start text-left": msg.sender === "ai",
                }
              )}
            >
              {msg.sender === "user" ? "You:" : "AI:"}

              {msg.createdAt && <span className="ml-1 text-sm text-neutral-500">
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
              </span>}
            </p>
            <div
              key={msg._id}
              className={cn(
                "w-fit max-w-[75%] px-4 py-2.5 rounded shadow",
                {
                  "bg-neutral-100 dark:bg-neutral-950 border border-transparent dark:border-neutral-600 ml-auto text-right text-neutral-900 dark:text-white": msg.sender === "user",
                  "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-transparent mr-auto text-left text-neutral-900 dark:text-white": msg.sender === "ai",
                }
              )}
            >
              {msg.sender === "user" ? (
                <>
                  {msg.content}
                </>
              ) : (
                <>
                  {msg.content === "form" ? (
                    <FormComponent />
                  ) : msg.content === "chart" ? (
                    <ChartComponent />
                  ) : msg.content === "status" ? (
                    <AccordionComponent />
                  ) : msg.content === "spreadsheet" ? (
                    <SpreadSheetComponent />
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
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </>
              )}
            </div>
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
