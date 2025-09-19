import 'server-only';

import type { Message } from '@/types';
import { createOpenAI } from '@ai-sdk/openai';
import {
  generateText,
  streamText,
  type LanguageModel,
  type ModelMessage,
} from 'ai';

function toModelMessages(msgs: Message[]): ModelMessage[] {
  return msgs.map((m) => ({ role: m.role, content: m.content }));
}

export const createOpenAIModel = ({
  apiKey,
  modelId = 'gpt-4o-mini',
}: {
  apiKey: string;
  modelId?: string;
}) => {
  const openai = createOpenAI({
    apiKey,
  });
  return openai(modelId);
};

export async function generateChatResponse(
  model: LanguageModel,
  messages: Message[]
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }

  const response = await generateText({
    model,
    messages: toModelMessages(messages),
  });

  return response.text.trim();
}

export async function generateChatTitle(
  model: LanguageModel,
  firstMessage: string
): Promise<string> {
  const response = await generateText({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that generates concise, descriptive titles for chat conversations. Generate a title that captures the essence of the first message in 3 short words or less.',
      },
      {
        role: 'user',
        content: firstMessage.slice(0, 500),
      },
    ],
    maxOutputTokens: 16,
    temperature: 0.3,
  });

  return response.text.trim();
}

export async function streamChatResponse(
  model: LanguageModel,
  messages: Message[]
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }

  return streamText({ model, messages: toModelMessages(messages) });
}
