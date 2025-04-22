import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TitleSchema, type TitleSchemaType } from "@/validators/ConversationSchema";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

type CreateConvoDialogProps = {
  triggerButtonText?: string;
  fullWidth?: boolean;
  icon?: boolean;
};

const CreateConvoDialog = ({
  triggerButtonText = "Create Convo",
  fullWidth = false,
  icon = true,
}: CreateConvoDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TitleSchemaType>({
    resolver: zodResolver(TitleSchema),
  });

  const { mutateAsync: createConversationMutation } = useMutation({
    mutationFn: async ({ userId, title }: { userId: string; title: string }) => {
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://localhost:3000/api/conversations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, title }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      return data.id;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete conversation");
    },
    onSuccess: () => {
      toast.success("Conversation created");
    }
  });

  const onSubmit = async ({ title }: TitleSchemaType) => {
    if (!user?.id) return;

    try {
      const newConversationId = await createConversationMutation({
        userId: user.id,
        title,
      });

      reset();
      setOpen(false);

      navigate(`/chat/${newConversationId}`);
      window.location.reload();
    } catch (error) {
      toast.error("Error creating conversation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("flex items-center", fullWidth && "w-full text-center")}>
          {triggerButtonText}
          {icon && <PlusCircleIcon className="ml-2 w-4 h-4" />}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogDescription>
            <Input
              placeholder="Enter conversation title"
              className="text-white"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </DialogDescription>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateConvoDialog;
