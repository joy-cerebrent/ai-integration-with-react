import React, { useState, memo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { Message } from "@/types/Message";
import { MessageType } from "@/enums/MessageType";
import { ContentType } from "@/enums/ContentType";
import { MessageStatus } from "@/enums/MessageStatus";
import { useAuth } from "@/context/AuthContext";
import { DynamicForm } from "@/components/DynamicForm";
import { toast } from "sonner";
import JsonViewer from "./JsonViewer";
import DataTable from "./DataTable";
import { Activity } from "@/types/Activity";
import ChartComponent from "./ChartComponent";

// Helper function to format message timestamps
const formatMessageTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    console.log("Formatted date:", date, timestamp);
    if (isNaN(date.getTime())) {
      return ""; // Return empty string for invalid dates
    }
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "";
  }
};

// Memoized markdown component
const MarkdownContent = memo(({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ className, children, ...rest }) {
        const match = /language-(\w+)/.exec(className || "");
        return match ? (
          <SyntaxHighlighter
            PreTag="div"
            language={match[1]}
            // @ts-expect-error React component type mismatch with SyntaxHighlighter
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
        <thead className="bg-neutral-200 dark:bg-neutral-800">{children}</thead>
      ),
      tbody: ({ children }) => (
        <tbody className="bg-white dark:bg-neutral-900">{children}</tbody>
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
    {content}
  </ReactMarkdown>
));
MarkdownContent.displayName = "MarkdownContent";

// Memoized form component with better key handling
const FormWrapper = memo(
  ({
    metadata,
    onSubmit,
    messageId,
  }: {
    metadata: Message["metadata"];
    onSubmit: (data: Record<string, string | number | boolean>) => void;
    messageId?: string | null;
  }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(
      async (data: Record<string, string | number | boolean>) => {
        setIsLoading(true);
        try {
          await onSubmit(data);
        } finally {
          setIsLoading(false);
        }
      },
      [onSubmit]
    );

    if (!metadata) return null;
    return (
      <DynamicForm
        key={`form-${messageId}-${metadata.formTitle}`}
        metadata={metadata}
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
      />
    );
  }
);
FormWrapper.displayName = "FormWrapper";

// Memoized activity item component
const ActivityItem = memo(({ activity }: { activity: Activity }) => (
  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-md p-3 text-sm">
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <p className="text-neutral-700 dark:text-neutral-300 flex-grow">
          {activity.message || "N/A"}
        </p>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
          {formatMessageTime(activity.timestamp)}
        </span>
      </div>{" "}
      {activity.content && (
        <div className="mt-1">
          {Array.isArray(activity.content) ? (
            <DataTable data={activity.content} />
          ) : (
            <JsonViewer data={activity.content} />
          )}
        </div>
      )}
    </div>
  </div>
));
ActivityItem.displayName = "ActivityItem";

const MessageItem: React.FC<{ msg: Message }> = ({ msg }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();

  const handleFormSubmit = useCallback(
    async (data: Record<string, string | number | boolean>) => {
      if (!user) {
        toast.error("User not logged in");
        return;
      }

      const formMessage: Message = {
        conversationId: msg.conversationId || undefined,
        type: MessageType.Answer,
        contentType: ContentType.Json,
        text: "Form submission",
        content: data,
        timestamp: new Date().toISOString(),
        requestCard: msg.requestCard,
        sender: "user",
        activities: [],
        messageStatus: MessageStatus.Pending,
      };

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${__API_BASE_URL__}/api/conversation/input`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formMessage),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit form");
        }

        const result = await response.json();
        if (result.status === "error") {
          toast.error(result.message || "Error submitting form");
        } else {
          toast.success("Form submitted successfully");
        }
      } catch (error) {
        toast.error("Error submitting form");
        console.error("Form submission error:", error);
      }
    },
    [msg.conversationId, msg.requestCard, user]
  );

  // Early return if message is null or undefined
  if (!msg) return null;

  // Determine if the message has activities
  const activities = msg.activities || [];
  const hasActivities = activities.length > 0;

  const renderMessageContent = () => {
    if (msg.type === MessageType.Question && msg.metadata) {
      return (
        <FormWrapper
          key={`form-${msg.id || msg.timestamp}`}
          metadata={msg.metadata}
          onSubmit={handleFormSubmit}
          messageId={msg.id || msg.timestamp}
        />
      );
    }
    if (msg.contentType === ContentType.Json && msg.content !== null) {
      let content =
        typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;

      // Handle nested array case - the data might be wrapped in multiple arrays
      if (
        Array.isArray(content) &&
        content.length === 1 &&
        Array.isArray(content[0])
      ) {
        content = content[0];
      }

      // If the content has labeled sections
      if (typeof content === "object" && !Array.isArray(content)) {
        return (
          <div className="space-y-6">
            {Object.entries(content).map(([key, value]) => {
              // Parse the value if it's a string that looks like an array
              let processedValue = value;
              if (
                typeof value === "string" &&
                value.trim().startsWith("[") &&
                value.trim().endsWith("]")
              ) {
                try {
                  processedValue = JSON.parse(value);
                } catch (e) {
                  console.error("Failed to parse array string:", e);
                }
              }

              return (
                <div key={key} className="space-y-2">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                    {key.replace(/_/g, " ")}:
                  </h3>
                  {Array.isArray(processedValue) &&
                  processedValue.length > 0 &&
                  // If items are objects with name/description, use table
                  typeof processedValue[0] === "object" &&
                  processedValue[0] !== null ? (
                    <DataTable data={processedValue} />
                  ) : (
                    <JsonViewer data={processedValue} />
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      // For array data, use DataTable
      if (Array.isArray(content)) {
        return <DataTable data={content} />;
      }

      // For other JSON data, use JsonViewer
      return <JsonViewer data={content} />;
    }

    return (
      <MarkdownContent
        content={typeof msg.content === "string" ? msg.content : msg.text || ""}
      />
    );
  };
  return (
    <li
      className={cn(
        "w-fit max-w-[75%] rounded-2xl shadow-sm transition-all list-none",
        {
          "bg-indigo-100 dark:bg-indigo-900 ml-auto p-3": msg.sender === "user",
          "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-transparent mr-auto p-4":
            msg.sender === "ai",
        }
      )}
    >
      {" "}
      {msg.sender === "user" ? (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-indigo-700 dark:text-indigo-200 font-medium">
              You
            </span>
            <span className="text-xs text-indigo-600/75 dark:text-indigo-300/75">
              {formatMessageTime(msg.timestamp)}
            </span>
          </div>
          <div className="text-indigo-900 dark:text-indigo-50">
            {typeof msg.content === "string" ? msg.content : msg.text || ""}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-sm text-neutral-700 dark:text-neutral-200">
              AI Assistant
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatMessageTime(msg.timestamp)}
            </span>
          </div>
          <div className="mt-1" key={`content-${msg.id || msg.timestamp}`}>
            {renderMessageContent()}
            {/* <ChartComponent/> */}
          </div>
        </>
      )}
      {hasActivities && (
        <div className="mt-3 border-t border-neutral-200 dark:border-neutral-700 pt-2">
          <button
            className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <svg
              className={cn("h-4 w-4 transition-transform", {
                "rotate-180": isExpanded,
              })}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {activities.length}{" "}
            {activities.length === 1 ? "Activity" : "Activities"}
          </button>
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {activities.map((activity, index) => (
                <ActivityItem key={activity.id || index} activity={activity} />
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default memo(MessageItem);
