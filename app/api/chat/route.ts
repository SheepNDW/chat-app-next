import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { Message } from 'ai';
import { createOpenAIModel, generateChatResponse } from '@/lib/ai-service';

const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).nonempty(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = ChatRequestSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const model = createOpenAIModel({
      apiKey,
    });

    const text = await generateChatResponse(
      model,
      parsed.data.messages as Message[]
    );

    return Response.json({ text });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
