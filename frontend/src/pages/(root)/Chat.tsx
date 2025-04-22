import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { MessageSchema, MessageSchemaType } from '@/validators/ConversationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';

const Chat = () => {
  const { id } = useParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MessageSchemaType>({
    resolver: zodResolver(MessageSchema),
  });

  const fetchMessages = async () => {
    try {
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
      setError(null);
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

  const onSubmit = async (data: MessageSchemaType) => {
    // TODO
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen flex-col p-6 pt-24 w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <h1 className="text-2xl font-semibold pb-2 mb-4 border-b-[1px]">{title}</h1>

      <ul className="flex-1 overflow-y-auto rounded space-y-4 mb-6">
        {messages.map((msg) => (
          <li
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
                <strong>You:</strong> {msg.content}
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
                  {msg.content}
                </ReactMarkdown>
              </>
            )}
          </li>
        ))}
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
