import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';

import ChatLink from '@/components/sidebar/ChatLink';
import CreateConvoDialog from '@/components/CreateConvoDialog';

const Sidebar = () => {
  const { user } = useAuth();

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
    <aside className="w-64 h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-4 pt-24 flex flex-col justify-between">
      <div className="flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
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

      <CreateConvoDialog triggerButtonText="New Conversation" fullWidth />
    </aside>
  )
}

export default Sidebar