'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CreateChatSchema } from '@/lib/schemas/validators';
import type { ChatWithMessages, Message, MessageRole } from '@/types';
import { redirect } from 'next/navigation';

export async function getAllChats() {
  return await prisma.chat.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      project: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  });
}

export async function getAllChatsByUser(
  userId: string
): Promise<ChatWithMessages[]> {
  return await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      project: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  });
}

export async function getChatById(
  id: string
): Promise<ChatWithMessages | null> {
  return await prisma.chat.findFirst({
    where: { id },
    include: {
      project: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function getChatByIdForUser(
  id: string,
  userId: string
): Promise<ChatWithMessages | null> {
  return await prisma.chat.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      project: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  });
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
  return await prisma.message.create({
    data: {
      content,
      role,
      chatId,
    },
  });
}

export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  return await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createChat(data: { title?: string; projectId?: string }) {
  const session = await auth();
  const userId = session?.user?.dbUserId;
  if (!userId) {
    redirect('/login');
  }

  const parsed = CreateChatSchema.parse(data);

  return await prisma.chat.create({
    data: {
      ...parsed,
      userId,
    },
    include: {
      project: true,
      messages: true,
    },
  });
}

export async function updateChat(
  id: string,
  data: { title?: string; projectId?: string; updatedAt?: Date }
) {
  const session = await auth();
  const userId = session?.user?.dbUserId;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const chat = await getChatByIdForUser(id, userId);

  if (!chat) {
    throw new Error('Chat not found');
  }

  const updated = await prisma.chat.update({
    where: {
      id,
    },
    data,
    include: {
      project: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return updated;
}

export async function deleteChat(id: string) {
  return await prisma.chat.deleteMany({
    where: { id },
  });
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
  const updatedChat = await updateChat(chatId, { projectId });

  if (!updatedChat.projectId) {
    throw new Error('Failed to assign chat to project');
  }

  redirect(`/projects/${updatedChat.projectId}/chats/${updatedChat.id}`);
}
