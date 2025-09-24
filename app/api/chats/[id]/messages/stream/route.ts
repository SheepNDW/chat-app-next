import {
  createMessageForChat,
  getMessagesByChatId,
} from '@/lib/actions/chat.actions';
import { createOpenAIModel } from '@/lib/ai-service';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/chats/[id]/messages/stream'>
) {
  try {
    const { id } = await ctx.params;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const clientMessages: UIMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    // Persist the last user message if it does not exist in DB yet.
    const lastClient = clientMessages[clientMessages.length - 1];
    if (lastClient && lastClient.role === 'user') {
      const historyCheck = await getMessagesByChatId(id);
      const alreadyExists = historyCheck.some((m) => m.id === lastClient.id);
      if (!alreadyExists) {
        const text = lastClient.parts
          .map((p) => (p.type === 'text' ? p.text : ''))
          .join('');
        if (text.trim()) {
          await createMessageForChat({
            chatId: id,
            content: text,
            role: 'user',
          });
        }
      }
    }

    const history = await getMessagesByChatId(id);
    const uiHistory: UIMessage[] = history.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      parts: [{ type: 'text', text: m.content }],
    }));

    if (!uiHistory.length && !clientMessages.length) {
      return Response.json(
        { error: 'No messages for this chat' },
        { status: 400 }
      );
    }

    const merged = [...uiHistory, ...clientMessages];

    const model = createOpenAIModel({ apiKey });
    const result = streamText({
      model,
      messages: convertToModelMessages(merged),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: merged,
      async onFinish({ messages }) {
        const last = messages[messages.length - 1];
        if (last?.role === 'assistant') {
          const text = last.parts
            .map((p) => (p.type === 'text' ? p.text : ''))
            .join('');
          if (text.trim()) {
            await createMessageForChat({
              chatId: id,
              content: text,
              role: 'assistant',
            });
          }
        }
      },
    });
  } catch (error) {
    console.error('Chat stream API error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
