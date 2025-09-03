import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { Message } from 'ai';
import { createOpenAIModel, streamChatResponse } from '@/lib/ai-service';

const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string().min(1),
});

const ChatStreamRequestSchema = z.object({
  messages: z.array(MessageSchema).nonempty(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = ChatStreamRequestSchema.safeParse(json);

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

    const textStream = await streamChatResponse(
      model,
      parsed.data.messages as Message[]
    );

    return new Response(textStream, {
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
