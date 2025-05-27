import { useLocation, useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type DeleteButtonProps = {
  conversationId: string;
}

export default function DeleteButton({ conversationId }: DeleteButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { mutateAsync: deleteConversationMutation } = useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${__API_BASE_URL__}/api/conversation/${conversationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      const data = await response.json();
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete conversation");
    },
    onSuccess: () => {
      toast.success("Conversation deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchConversations", user?.id] });
    }
  });

  const handleDelete = async () => {
    await deleteConversationMutation({ conversationId });

    if (location.pathname === `/chat/${conversationId}`) {
      navigate("/");
    }
  };

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 p-0",
        "text-neutral-500 dark:text-neutral-400",
        "hover:text-red-600 dark:hover:text-red-400",
        "hover:bg-red-100 dark:hover:bg-red-900/20",
        "transition-colors duration-200"
      )}
      title="Delete conversation"
    >
      <Trash className="h-4 w-4" />
    </Button>
  );
}
