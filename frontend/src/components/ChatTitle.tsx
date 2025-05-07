import { useState } from 'react';
import { PenIcon, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { TitleSchema, TitleSchemaType } from '@/validators/ConversationSchema';
import { zodResolver } from '@hookform/resolvers/zod';

type ChatTitleProps = {
  id: string;
  title: string;
};

const ChatTitle = ({ id, title }: ChatTitleProps) => {
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

  const handleTitleRename = async (data: TitleSchemaType) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:3000/api/conversations/rename/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: data.title }),
      });

      if (!res.ok) throw new Error('Failed to rename title');

      setIsEditingTitle(false);
      window.location.reload();
    } catch (err) {
      console.error('Rename failed:', err);
    }
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
