import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { createChatAndRedirect } from '@/lib/actions/chat.actions';

export default function ChatsPage() {
  const createChat = async () => {
    'use server';
    await createChatAndRedirect();
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to AI Chat
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Start a conversation with AI to get help with any topic
        </p>
        <form action={createChat}>
          <Button size="lg" type="submit">
            <Plus className="h-5 w-5" />
            Start New Chat
          </Button>
        </form>
      </div>
    </div>
  );
}
