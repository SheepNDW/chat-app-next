import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ChatsPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to AI Chat
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Start a conversation with AI to get help with any topic
        </p>
        <Button size="lg">
          <Plus className="h-5 w-5" />
          Start New Chat
        </Button>
      </div>
    </div>
  );
}
