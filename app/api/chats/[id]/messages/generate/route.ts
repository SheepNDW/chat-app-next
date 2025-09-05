import { getMessagesByChatId } from '@/lib/actions/chat.actions';
import { createOpenAIModel, generateChatResponse } from '@/lib/ai-service';
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

    const text = await generateChatResponse(model, history);

    return Response.json({ text });
  } catch (error) {
    console.error('Chat generate API error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
