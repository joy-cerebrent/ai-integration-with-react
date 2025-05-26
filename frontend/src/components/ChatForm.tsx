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
  const { register, handleSubmit, reset } = useForm<MessageSchemaType>();

  const handleFormSubmit = async (data: MessageSchemaType) => {
    await onSubmit(data);
    reset(); // Reset form after successful submission
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  return (    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col sm:flex-row items-end gap-3 mt-auto p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm"
    >
      {/* <div className="w-full sm:w-[40%]">
        <Input
          type="file"
          accept="application/pdf"
          onChange={(e) => setValue("file", e.target.files?.[0])}
          disabled={isSubmitting}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 border border-neutral-200 dark:border-neutral-700 text-sm"
        />
        {errors.file && (
          <p className="text-sm text-red-500 mt-1">{errors.file.message}</p>
        )}
      </div> */}

      <div className="flex-1">        <Textarea
          placeholder="Type your message... (Ctrl + Enter to send)"
          {...register("prompt")}
          disabled={isSubmitting}
          className="min-h-[80px] resize-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg"
          onKeyDown={handleKeyDown}
        />
        {errors.prompt && (
          <p className="text-sm text-red-500 mt-1">{errors.prompt.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-full transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          "Send"
        )}
      </Button>
    </form>
  );
};

export default ChatForm;
