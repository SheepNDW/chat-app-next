'use server';

import { Message } from '@/types';

const mockMessages: { [chatId: string]: Message[] } = {};

export async function getChatMessages(chatId: string): Promise<Message[]> {
  if (!mockMessages[chatId]) {
    mockMessages[chatId] = [
      {
        id: '1',
        chatId: chatId,
        content: 'Hello! How can I help you today?',
        role: 'assistant',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        id: '2',
        chatId: chatId,
        content: 'I have a question about React.',
        role: 'user',
        createdAt: new Date('2024-01-01T10:01:00Z'),
        updatedAt: new Date('2024-01-01T10:01:00Z'),
      },
      {
        id: '3',
        chatId: chatId,
        content: 'Sure! What would you like to know about React?',
        role: 'assistant',
        createdAt: new Date('2024-01-01T10:02:00Z'),
        updatedAt: new Date('2024-01-01T10:02:00Z'),
      },
    ];
  }

  return mockMessages[chatId];
}

export async function addMessage(
  chatId: string,
  content: string
): Promise<Message[]> {
  // 確保有 mock 數據
  if (!mockMessages[chatId]) {
    await getChatMessages(chatId);
  }

  // 創建新的訊息
  const newMessage: Message = {
    id: Date.now().toString(),
    chatId: chatId,
    content: content,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 添加到 mock 數據中
  mockMessages[chatId].push(newMessage);

  // 模擬 AI 回應
  const aiResponse: Message = {
    id: (Date.now() + 1).toString(),
    chatId: chatId,
    content: `This is a mock AI response to: "${content}"`,
    role: 'assistant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockMessages[chatId].push(aiResponse);
  // mock delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 返回更新後的所有訊息
  return mockMessages[chatId];
}
