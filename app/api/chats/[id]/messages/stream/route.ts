import {
  createMessageForChat,
  getMessagesByChatId,
} from '@/lib/actions/chat.actions';
import { createOpenAIModel, streamChatResponse } from '@/lib/ai-service';
import { NextRequest } from 'next/server';

export async function POST(
  _req: NextRequest,
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

    const history = await getMessagesByChatId(id);
    if (!history.length) {
      return Response.json(
        { error: 'No messages for this chat' },
        { status: 400 }
      );
    }

    const model = createOpenAIModel({ apiKey });

    const aiStream = await streamChatResponse(model, history);

    let full = '';
    const transformer = new TransformStream({
      transform(chunk: string, controller) {
        full += chunk;
        controller.enqueue(chunk);
      },
      async flush() {
        if (full.trim()) {
          try {
            await createMessageForChat({
              chatId: id,
              content: full,
              role: 'assistant',
            });
          } catch (err) {
            console.error('Persist assistant (stream flush) failed:', err);
          }
        }
      },
    });

    const piped = aiStream.pipeThrough(transformer);

    return new Response(piped, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat stream API error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
