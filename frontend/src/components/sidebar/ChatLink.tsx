import { useLocation, Link } from "react-router-dom";

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
      key={id}
      className={cn(
        "relative group flex items-center justify-between rounded transition",
        "hover:bg-neutral-200 dark:hover:bg-neutral-800",
        isActive && "bg-neutral-100 dark:bg-neutral-700"
      )}
    >
      <Link
        to={`/chat/${id}`}
        className="block w-full px-3 py-1.5 truncate text-neutral-900 dark:text-neutral-100"
      >
        {title}
      </Link>

      <DeleteButton conversationId={id} />
    </li>
  );
}
