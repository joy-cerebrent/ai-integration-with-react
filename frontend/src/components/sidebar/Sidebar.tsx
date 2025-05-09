import { useState } from 'react';
import { ChevronLeft, PlusCircleIcon } from "lucide-react";

import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';

import ChatLink from '@/components/sidebar/ChatLink';
import CreateConvoButton from '@/components/CreateConvoButton';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ["fetchConversations", user?.id],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`http://localhost:3000/api/conversations/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await res.json();

      return data.conversations;
    },
  });

  return (
    <div className="flex">
      <aside
        className={cn(
          "h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-hidden",
          collapsed ? "max-w-0 p-0" : "max-w-80 w-80 pt-24 px-4 pb-4"
        )}
      >

        <div className="flex flex-col gap-4 overflow-y-auto">
          <h2 className="relative text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Conversations
          </h2>

          {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
          {error && <p className="text-sm text-red-500">Failed to load conversations.</p>}

          <ul className="space-y-2">
            {conversations?.map((conv: {
              _id: string;
              title: string;
            }) => (
              <ChatLink
                key={conv._id}
                id={conv._id}
                title={conv.title}
              />
            ))}
          </ul>
        </div>

        <CreateConvoButton fullWidth>
          New Conversation
          <PlusCircleIcon />
        </CreateConvoButton>
      </aside>

      <div className="h-full flex items-center">
        <button
          className="cursor-pointer transition hover:bg-neutral-700 rounded-sm m-0.5 py-2"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <ChevronLeft
            className={cn(
              "transition duration-300",
              collapsed && "rotate-180"
            )}
            size={32}
          />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;