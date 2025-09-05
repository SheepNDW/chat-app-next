import { getMessagesByChatId } from '@/lib/actions/chat.actions';
import { createOpenAIModel, generateChatResponse } from '@/lib/ai-service';
import { NextRequest } from 'next/server';

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<'/api/chats/[id]/messages/generate'>
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

    const text = await generateChatResponse(model, history);

    return Response.json({ text });
  } catch (error) {
    console.error('Chat generate API error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
