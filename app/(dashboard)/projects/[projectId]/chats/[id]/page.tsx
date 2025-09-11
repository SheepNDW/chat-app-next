import ChatWindow from '@/components/chat/chat-window';
import { getChatById, getMessagesByChatId } from '@/lib/actions/chat.actions';
import { getProjectById } from '@/lib/actions/project.actions';
import { ChatProvider } from '@/lib/chat/ChatProvider';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ projectId: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId, id } = await params;

  const chat = await getChatById(id);
  const project = await getProjectById(projectId);

  return {
    title: `${chat?.title || 'Untitled'} - Project ${project?.name}`,
  };
}

export default async function ProjectChatDetailPage({ params }: Props) {
  const { id } = await params;

  const chat = await getChatById(id);

  if (!chat) notFound();

  const messages = await getMessagesByChatId(chat.id);

  return (
    <ChatProvider
      chatId={id}
      initialMessages={messages}
      chat={chat || undefined}
    >
      <ChatWindow />
    </ChatProvider>
  );
}
