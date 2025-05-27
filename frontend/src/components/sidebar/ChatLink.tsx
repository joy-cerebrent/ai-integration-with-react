import { useLocation, Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import DeleteButton from "@/components/sidebar/DeleteButton";

type ChatLinkProps = {
  id: string;
  title: string;
}

export default function ChatLink({ id, title }: ChatLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === `/chat/${id}`;

  return (
    <li
      className={cn(
        "group relative flex items-center justify-between",
        "rounded-lg transition-colors duration-200",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        isActive && "bg-neutral-100 dark:bg-neutral-800",
        "ring-1 ring-transparent",
        isActive && "ring-neutral-200 dark:ring-neutral-700"
      )}
    >
      <Link
        to={`/chat/${id}`}
        className="flex items-center gap-3 w-full px-3 py-2"
      >
        <MessageSquare className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        <span className="truncate text-sm text-neutral-900 dark:text-neutral-100">
          {title}
        </span>
      </Link>

      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DeleteButton conversationId={id} />
      </div>
    </li>
  );
}
