import React, { ComponentPropsWithoutRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateConvoButtonProps = {
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: "default" | "outline" | "ghost";
};

const CreateConvoButton = ({
  children,
  fullWidth = false,
  variant = "default",
  ...props
}: CreateConvoButtonProps & ComponentPropsWithoutRef<"button">) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync: createConversationMutation, isPending } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${__API_BASE_URL__}/api/conversation/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
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
      queryClient.invalidateQueries({ queryKey: ["fetchConversations", user?.id] });
    }
  });

  const handleClick = async () => {
    if (!user?.id) return;

    try {
      const newConversationId = await createConversationMutation({ userId: user.id });
      navigate(`/chat/${newConversationId}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center",
        "transition-all duration-200 ease-in-out",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600",
        "active:scale-95",
        fullWidth && "w-full",
        variant === "default" && [
          "bg-gradient-to-r from-neutral-900 to-neutral-800",
          "dark:from-neutral-100 dark:to-neutral-200",
          "hover:from-neutral-800 hover:to-neutral-700",
          "dark:hover:from-neutral-200 dark:hover:to-neutral-300",
          "text-white dark:text-neutral-900",
          "shadow-sm hover:shadow-md",
        ],
        variant === "outline" && [
          "border border-neutral-200 dark:border-neutral-800",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "text-neutral-900 dark:text-neutral-100",
        ],
        variant === "ghost" && [
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "text-neutral-900 dark:text-neutral-100",
        ],
        props.className
      )}
      disabled={isPending}
      {...props}
    >
      <span className="inline-flex items-center gap-2 group">
        {isPending ? "Creating..." : children}
      </span>
    </Button>
  );
};

export default CreateConvoButton;