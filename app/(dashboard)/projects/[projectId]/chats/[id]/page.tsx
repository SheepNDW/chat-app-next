import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatProvider } from '@/lib/chat/ChatProvider';
import ChatWindow from '@/app/(dashboard)/chats/[id]/chat-window';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ projectId: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId, id } = await params;

  return {
    title: `Chat ${id} - Project ${projectId}`,
    description: `AI conversation in project ${projectId}`,
  };
}

export default async function ProjectChatDetailPage({ params }: Props) {
  const { projectId, id } = await params;

  // TODO: Implement getChatById with project context
  // const chat = await getChatById(id, projectId);
  // const messages = chat?.messages || [];

  // Placeholder data for now
  const chat = null;
  const messages: any[] = [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${projectId}` as any}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href={`/projects/${projectId}` as any}
                className="hover:text-foreground transition-colors"
              >
                Project {projectId}
              </Link>
              <span>/</span>
              <span>Chat {id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1">
        <ChatProvider
          chatId={id}
          initialMessages={messages}
          chat={chat || undefined}
        >
          <ChatWindow />
        </ChatProvider>
      </div>
    </div>
  );
}
