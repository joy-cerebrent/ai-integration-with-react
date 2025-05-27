import { useState } from "react";
import { ChevronLeft, PlusCircleIcon } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

import ChatLink from "@/components/sidebar/ChatLink";
import CreateConvoButton from "@/components/CreateConvoButton";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fetchConversations", user?.id],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${__API_BASE_URL__}/api/conversation/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      return data;
    },
  });

  return (
    <div className="flex">
      <aside
        className={cn(
          "h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800",
          "flex flex-col justify-between transition-all duration-300 ease-in-out overflow-hidden",
          "shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50",
          collapsed ? "max-w-0 p-0" : "max-w-80 w-80 pt-24 px-4 pb-4"
        )}
      >
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
          <h2 className="relative text-xl font-semibold text-neutral-900 dark:text-neutral-100 px-2">
            Conversations
          </h2>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-900 dark:border-neutral-100" />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md p-3">
              Failed to load conversations.
            </div>
          )}

          <ul className="space-y-1 px-2">
            {conversations?.map((conv: { id: string; title: string }) => (
              <ChatLink key={conv.id} id={conv.id} title={conv.title} />
            ))}
          </ul>
        </div>

        <CreateConvoButton
          className={cn(
            "mt-4 w-full gap-2"
          )}
          fullWidth
        >
          <PlusCircleIcon
            className={cn(
              "h-5 w-5",
              "transition-transform duration-200",
              "group-hover:scale-110"
            )}
          />
          <span className="font-medium">New Conversation</span>
        </CreateConvoButton>
      </aside>

      <button
        className={cn(
          "fixed left-[280px] top-1/2 -translate-y-1/2 z-50",
          "h-12 w-6 flex items-center justify-center",
          "transition-all duration-300 ease-in-out",
          "bg-white dark:bg-neutral-900",
          "border border-neutral-200 dark:border-neutral-800",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "rounded-r-md",
          collapsed && "left-0"
        )}
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            "text-neutral-700 dark:text-neutral-300",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </div>
  );
};

export default Sidebar;
