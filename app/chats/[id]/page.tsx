import { getMessagesByChatId } from '@/lib/actions/chat.actions';
import ChatWindow from './chat-window';

export default async function ChatDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const messages = await getMessagesByChatId(id);

  return (
    <div className="h-full flex flex-col">
      <ChatWindow messages={messages} chatId={id} />
    </div>
  );
}
