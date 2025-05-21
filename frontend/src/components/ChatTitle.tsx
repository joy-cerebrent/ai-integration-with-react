import { useState } from 'react';
import { PenIcon, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { TitleSchema, TitleSchemaType } from '@/validators/ConversationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

type ChatTitleProps = {
  id: string;
  title: string;
};

const ChatTitle = ({ id, title }: ChatTitleProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TitleSchemaType>({
    resolver: zodResolver(TitleSchema),
    defaultValues: {
      title,
    },
  });

  const { mutateAsync: renameTitleMutation } = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      // setTitle(title);

      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${__API_BASE_URL__}/api/process/rename/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error('Failed to rename title');

      return res.json();
    },
    onSuccess: () => {
      toast.success("Title Updated");
      queryClient.invalidateQueries({ queryKey: ['fetchConversations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
    },
    onError: () => {
      toast.error("Failed to rename title")
    },
  });

  const handleTitleRename = async (data: TitleSchemaType) => {
    await renameTitleMutation({ id, title: data.title });
    setIsEditingTitle(false);
  };

  return (
    <div className="w-full flex items-center gap-2 group text-2xl font-semibold pb-2 mb-4 border-b-[1px]">
      {isEditingTitle ? (
        <form onSubmit={handleSubmit(handleTitleRename)} className="flex items-center gap-2 w-full">
          <div className="flex flex-col w-full">
            <Input
              {...register('title')}
              autoFocus
              placeholder="Enter Chat Title..."
              className="w-full"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <X
            size={20}
            onClick={() => {
              setIsEditingTitle(false);
              reset();
            }}
            className="cursor-pointer"
          />

          <Button type="submit" size="sm" className="text-sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </form>
      ) : (
        <>
          <span className="truncate max-w-[calc(100%-2rem)]">{title}</span>
          <PenIcon
            className="opacity-0 group-hover:opacity-100 cursor-pointer"
            size={20}
            onClick={() => {
              setIsEditingTitle(true);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ChatTitle;
