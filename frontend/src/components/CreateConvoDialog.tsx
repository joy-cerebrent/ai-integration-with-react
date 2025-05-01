import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateConvoButtonProps = {
  triggerButtonText?: string;
  fullWidth?: boolean;
  icon?: boolean;
};

const CreateConvoButton = ({
  triggerButtonText = "Create Convo",
  fullWidth = false,
  icon = true,
}: CreateConvoButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { mutateAsync: createConversationMutation, isPending } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://localhost:3000/api/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }), // no title sent
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      return data.id;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create conversation");
    },
    onSuccess: () => {
      toast.success("Conversation created");
    }
  });

  const handleClick = async () => {
    if (!user?.id) return;

    try {
      const newConversationId = await createConversationMutation({ userId: user.id });
      navigate(`/chat/${newConversationId}`);
      window.location.reload(); // optional: if chat page needs refresh
    } catch {
      // handled by onError
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cn("flex items-center", fullWidth && "w-full text-center")}
      disabled={isPending}
    >
      {isPending ? "Creating..." : triggerButtonText}
      {icon && <PlusCircleIcon className="ml-2 w-4 h-4" />}
    </Button>
  );
};

export default CreateConvoButton;
