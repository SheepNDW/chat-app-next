import ChatWindow from '@/app/(dashboard)/chats/[id]/chat-window';
import { getChatById, getMessagesByChatId } from '@/lib/actions/chat.actions';
import { getProjectById } from '@/lib/actions/project.actions';
import { ChatProvider } from '@/lib/chat/ChatProvider';
import type { Metadata } from 'next';

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
  const messages = await getMessagesByChatId(id);

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
