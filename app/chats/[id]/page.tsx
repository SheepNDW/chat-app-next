interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <h1 className="text-xl font-semibold mb-4">Chat {params.id}</h1>
        <div className="space-y-4">
          {/* TODO: Add chat messages display */}
          <div className="text-muted-foreground">
            Chat interface will be implemented here
          </div>
        </div>
      </div>
      <div className="border-t border-border p-4">
        {/* TODO: Add message input */}
        <div className="text-muted-foreground text-sm">
          Message input will be implemented here
        </div>
      </div>
    </div>
  );
}
