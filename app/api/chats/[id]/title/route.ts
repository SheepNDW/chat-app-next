import { auth } from '@/auth';
import { getChatByIdForUser, updateChat } from '@/lib/actions/chat.actions';
import { createOpenAIModel, generateChatTitle } from '@/lib/ai-service';
import { UpdateChatTitleSchema } from '@/lib/schemas/validators';

export async function POST(req: Request, ctx: any) {
  try {
    const session = await auth();
    const userId = session?.user?.dbUserId;
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!id) {
      return Response.json({ error: 'Missing chat id' }, { status: 400 });
    }

    // Ownership check (and existence)
    const chat = await getChatByIdForUser(id, userId);
    if (!chat) {
      return Response.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Validate body
    const json = await req.json().catch(() => null);
    const parsed = UpdateChatTitleSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: 'Bad Request' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const model = createOpenAIModel({ apiKey });
    const title = await generateChatTitle(model, parsed.data.message);

    const updated = await updateChat(id, { title });
    return Response.json({ chat: updated });
  } catch (error) {
    console.error('Chat title API error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
