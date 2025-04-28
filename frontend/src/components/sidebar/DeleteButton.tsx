import { useLocation, useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

type DeleteButtonProps = {
  conversationId: string;
}

export default function DeleteButton({ conversationId }: DeleteButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { mutateAsync: deleteConversationMutation } = useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`http://localhost:5109/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete conversation");
    },
    onSuccess: () => {
      toast.success("Conversation deleted successfully");
    }
  });

  const handleDelete = async () => {
    await deleteConversationMutation({ conversationId });

    if (location.pathname === `/chat/${conversationId}`) {
      navigate("/");
    }

    window.location.reload();
  };

  return (
    <Button
      onClick={handleDelete}
      className="p-1 opacity-0 group-hover:opacity-100 transition"
      variant="destructive"
      title="Delete"
    >
      <Trash size={16} />
    </Button>
  );
}
