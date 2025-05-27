import CreateConvoButton from '@/components/CreateConvoButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useTitle } from '@/hooks/useTitle';
import { MessageSchema, MessageSchemaType } from '@/validators/ConversationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  useTitle("Home");

  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MessageSchemaType>({
    resolver: zodResolver(MessageSchema),
  });

  const onSubmit = async (data: MessageSchemaType) => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");

    const response = await fetch("http://localhost:3000/api/conversations/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!response.ok) {
      throw new Error("Failed to create conversation");
    }

    const responseData = await response.json();

    const conversationId = responseData.id;

    const userMessage = {
      conversationId,
      content: data.prompt,
      sender: "user"
    };

    await fetch("http://localhost:3000/api/messages/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userMessage),
    });

    const aiResponse = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: data.prompt }),
    });

    const aiContent = await aiResponse.json();

    await fetch("http://localhost:3000/api/messages/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId,
        content: aiContent.trim(),
        sender: "ai"
      }),
    });

    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="p-6 pt-24 h-screen w-full flex flex-col justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Welcome</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg">
            Click on one of the chats on the sidebar, or start a new conversation by clicking the button below, or directly start a chat by typing a prompt below 👇.
          </h3>

          <CreateConvoButton fullWidth>
            Create a new Converstaion
          </CreateConvoButton>
        </CardContent>
      </Card>

      {/* <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col sm:flex-row items-center gap-4 mt-auto"
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
      </form> */}
    </div >
  )
}

export default Home