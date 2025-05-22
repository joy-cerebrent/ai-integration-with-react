import React from "react";
import { useForm, UseFormSetValue } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSchemaType } from "@/validators/ConversationSchema";

const ChatForm: React.FC<{
  onSubmit: (data: MessageSchemaType) => void;
  isSubmitting: boolean;
  setValue: UseFormSetValue<MessageSchemaType>;
  errors: { [key: string]: any };
}> = ({ onSubmit, isSubmitting, setValue, errors }) => {
  const { register, handleSubmit } = useForm<MessageSchemaType>();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row items-center gap-4 mt-auto"
    >
      <div className="w-[40%]">
        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setValue("file", e.target.files?.[0])}
          disabled={isSubmitting}
        />
        {errors.file && (
          <p className="text-sm text-red-500 mt-1">{errors.file.message}</p>
        )}
      </div>

      <div className="w-full">
        <Textarea
          placeholder="Type your message..."
          {...register("prompt")}
          disabled={isSubmitting}
        />
        {errors.prompt && (
          <p className="text-sm text-red-500 mt-1">{errors.prompt.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send"}
      </Button>
    </form>
  );
};

export default ChatForm;
