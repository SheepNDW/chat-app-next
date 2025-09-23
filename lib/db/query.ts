import { prisma } from './prisma';
import type {
  ChatWithMessages,
  Message,
  Project,
  ProjectWithChats,
} from '@/types';

// Chat Queries
export async function dbGetAllChats() {
  return prisma.chat.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      project: true,
      messages: { orderBy: { createdAt: 'asc' }, take: 1 },
    },
  });
}

export async function dbGetAllChatsByUser(
  userId: string
): Promise<ChatWithMessages[]> {
  return prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      project: true,
      messages: { orderBy: { createdAt: 'asc' }, take: 1 },
    },
  });
}

export async function dbGetChatById(
  id: string
): Promise<ChatWithMessages | null> {
  return prisma.chat.findFirst({
    where: { id },
    include: {
      project: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function dbGetChatByIdForUser(
  id: string,
  userId: string
): Promise<ChatWithMessages | null> {
  return prisma.chat.findFirst({
    where: { id, userId },
    include: {
      project: true,
      messages: { orderBy: { createdAt: 'asc' }, take: 1 },
    },
  });
}

export async function dbGetMessagesByChatId(
  chatId: string
): Promise<Message[]> {
  return prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });
}

// Project Queries
export async function dbGetAllProjects(): Promise<Project[]> {
  return prisma.project.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function dbGetAllProjectsByUser(
  userId: string
): Promise<Project[]> {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function dbGetProjectById(
  id: string
): Promise<ProjectWithChats | null> {
  return prisma.project.findFirst({
    where: { id },
    include: {
      chats: {
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
    },
  });
}

export async function dbGetProjectByIdForUser(
  id: string,
  userId: string
): Promise<Project | null> {
  return prisma.project.findFirst({ where: { id, userId } });
}
