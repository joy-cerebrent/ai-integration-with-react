import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { Message } from "@/types/Message";
import { MessageType } from "@/enums/MessageType";
import FormComponent from "@/components/FormComponent";

const MessageItem: React.FC<{ msg: Message }> = ({ msg }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
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
            : msg.message || ""}
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

      {/* Expander Panel for Activities */}
      {msg.activities && msg.activities.length > 0 && (
        <div className="mt-2">
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? "Hide Activities" : "Show Activities"}
          </button>
          {isExpanded && (
            <ul className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
              {msg.activities.map((activity, index) => (
                <li key={index} className="border-b border-neutral-200 dark:border-neutral-700 pb-1">
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    <span className="block">Timestamp: {new Date(activity.timestamp).toLocaleString()}</span>
                    <span className="block">Title: {activity.title || "N/A"}</span>
                    <span className="block">Message: {activity.message || "N/A"}</span>
                    {activity.content && (
                      <span className="block">Content: {JSON.stringify(activity.content)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};

export default MessageItem;
