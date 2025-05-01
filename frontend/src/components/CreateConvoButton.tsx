import React, { ComponentPropsWithoutRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateConvoButtonProps = {
  children: React.ReactNode;
  fullWidth?: boolean;
};

const CreateConvoButton = ({
  children,
  fullWidth = false,
  ...props
}: CreateConvoButtonProps & ComponentPropsWithoutRef<"button">) => {
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
    }
  });

  const handleClick = async () => {
    if (!user?.id) return;

    try {
      const newConversationId = await createConversationMutation({ userId: user.id });
      navigate(`/chat/${newConversationId}`);
      window.location.reload();
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cn("flex items-center", fullWidth && "w-full text-center")}
      disabled={isPending}
      {...props}
    >
      {isPending ? "Creating..." : children}
    </Button>
  );
};

export default CreateConvoButton;
