import { getChatById } from '@/lib/actions/chat.actions';
import ChatWindow from '@/components/chat/chat-window';
import { ChatProvider } from '@/lib/chat/ChatProvider';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const chat = await getChatById(id);

  return {
    title: chat?.title || 'Untitled Chat',
  };
}

export default async function ChatDetailPage({ params }: Props) {
  const { id } = await params;
  const chat = await getChatById(id);

  if (!chat) notFound();

  const messages = chat.messages || [];

  return (
    <div className="h-[calc(100%-4rem)] flex flex-col">
      <ChatProvider
        chatId={id}
        initialMessages={messages}
        chat={chat || undefined}
      >
        <ChatWindow />
      </ChatProvider>
    </div>
  );
}
