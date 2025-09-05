import {
  getMessagesByChatId,
  createMessageForChat,
} from '@/lib/actions/chat.actions';
import { createOpenAIModel, streamChatResponse } from '@/lib/ai-service';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const ParamsSchema = z.object({ id: z.uuid() });

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parsed = ParamsSchema.safeParse(params);
    if (!parsed.success) {
      return Response.json({ error: 'Invalid chat id' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const history = await getMessagesByChatId(parsed.data.id);
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
              chatId: parsed.data.id,
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
