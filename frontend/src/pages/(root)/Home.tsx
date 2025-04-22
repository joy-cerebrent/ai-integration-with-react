import CreateConvoDialog from '@/components/CreateConvoDialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="pt-24 h-screen w-full flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Welcome</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg">
            Click on one of the chats on the sidebar, or start a new conversation by clicking the button below.
          </h3>

          <CreateConvoDialog fullWidth icon={false} />
        </CardContent>
      </Card>
    </div>
  )
}

export default Home