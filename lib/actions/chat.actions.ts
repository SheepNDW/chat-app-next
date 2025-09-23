'use server';

import {
  dbCreateChat,
  dbCreateMessageForChat,
  dbDeleteChat,
  dbUpdateChat,
} from '@/lib/db/mutations';
import {
  dbGetAllChatsByUser,
  dbGetChatById,
  dbGetChatByIdForUser,
  dbGetMessagesByChatId,
  dbGetProjectById,
} from '@/lib/db/query';
import { CreateChatSchema } from '@/lib/schemas/validators';
import type { ChatWithMessages, Message, MessageRole } from '@/types';
import { redirect } from 'next/navigation';
import { requireUserId } from './auth-helpers';

export async function getAllChats() {
  const userId = await requireUserId();
  return dbGetAllChatsByUser(userId);
}

export async function getAllChatsByUser(
  userId: string
): Promise<ChatWithMessages[]> {
  return dbGetAllChatsByUser(userId);
}

export async function getChatById(
  id: string
): Promise<ChatWithMessages | null> {
  const userId = await requireUserId();
  const chat = await dbGetChatById(id);
  if (!chat || chat.userId !== userId) return null;
  return chat;
}

export async function getChatByIdForUser(
  id: string,
  userId: string
): Promise<ChatWithMessages | null> {
  return dbGetChatByIdForUser(id, userId);
}

export async function createMessageForChat({
  chatId,
  content,
  role,
}: {
  chatId: string;
  content: string;
  role: MessageRole;
}) {
  const userId = await requireUserId();
  const chat = await dbGetChatById(chatId);
  if (!chat || chat.userId !== userId) throw new Error('Chat not found');
  return dbCreateMessageForChat({ chatId, content, role });
}

export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  const userId = await requireUserId();
  const chat = await dbGetChatById(chatId);
  if (!chat || chat.userId !== userId) throw new Error('Chat not found');
  return dbGetMessagesByChatId(chatId);
}

export async function createChat(data: { title?: string; projectId?: string }) {
  const userId = await requireUserId();

  const parsed = CreateChatSchema.parse(data);

  if (parsed.projectId) {
    const project = await dbGetProjectById(parsed.projectId);
    if (!project || project.userId !== userId)
      throw new Error('Project not found');
  }

  return dbCreateChat({ ...parsed, userId });
}

export async function updateChat(
  id: string,
  data: { title?: string; projectId?: string; updatedAt?: Date }
) {
  const userId = await requireUserId();

  const chat = await dbGetChatByIdForUser(id, userId);

  if (!chat) {
    throw new Error('Chat not found');
  }

  return dbUpdateChat(id, data);
}

export async function deleteChat(id: string) {
  const userId = await requireUserId();
  const chat = await dbGetChatById(id);
  if (!chat || chat.userId !== userId) throw new Error('Chat not found');
  return dbDeleteChat(id);
}

/**
 * Server action: create a chat for current user and redirect to it.
 * Accepts either a FormData (`<form action=...>`) or direct param object.
 */
export async function createChatAndRedirect(
  options: { projectId?: string } = {}
) {
  const chat = await createChat(options);

  if (!chat || !chat.id) {
    throw new Error('Failed to create chat');
  }

  redirect(
    chat.projectId
      ? `/projects/${chat.projectId}/chats/${chat.id}`
      : `/chats/${chat.id}`
  );
}

export async function assignChatToProject(chatId: string, projectId: string) {
  const userId = await requireUserId();
  const chat = await dbGetChatById(chatId);
  if (!chat || chat.userId !== userId) throw new Error('Chat not found');
  const project = await dbGetProjectById(projectId);
  if (!project || project.userId !== userId)
    throw new Error('Project not found');
  const updatedChat = await updateChat(chatId, { projectId });

  if (!updatedChat.projectId) {
    throw new Error('Failed to assign chat to project');
  }

  redirect(`/projects/${updatedChat.projectId}/chats/${updatedChat.id}`);
}
