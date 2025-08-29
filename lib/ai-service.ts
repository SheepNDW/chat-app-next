import 'server-only';

import { createOpenAI } from '@ai-sdk/openai';
import {
  generateText,
  streamText,
  type LanguageModelV1,
  type Message,
} from 'ai';

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
  model: LanguageModelV1,
  messages: Message[]
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }

  const response = await generateText({
    model,
    messages,
  });

  return response.text.trim();
}

export async function generateChatTitle(
  model: LanguageModelV1,
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
    maxTokens: 16,
    temperature: 0.3,
  });

  return response.text.trim();
}

export async function streamChatResponse(
  model: LanguageModelV1,
  messages: Message[]
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }

  return streamText({ model, messages }).textStream;
}
