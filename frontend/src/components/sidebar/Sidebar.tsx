import { useState } from 'react';
import { Menu, PlusCircleIcon } from "lucide-react";

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
    }
  })

  return (
    <aside
      className={cn(
        "h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 pt-24 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "max-w-0 px-0" : "max-w-80 w-80 px-4 pb-4"
      )}
    >

      <div className="flex flex-col gap-4 overflow-y-auto">
        <button
          className="fixed cursor-pointer z-50 p-1 top-24 bg-white dark:bg-neutral-900 rounded-md shadow"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <Menu />
        </button>

        <h2 className="relative pl-10 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
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
  )
}

export default Sidebar