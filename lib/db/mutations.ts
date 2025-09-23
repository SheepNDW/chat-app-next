import type { MessageRole, Project } from '@/types';
import { prisma } from './prisma';

// Chat mutations
export async function dbCreateChat(data: {
  title?: string;
  projectId?: string;
  userId: string;
}) {
  return prisma.chat.create({
    data,
    include: { project: true, messages: true },
  });
}

export async function dbUpdateChat(
  id: string,
  data: { title?: string; projectId?: string; updatedAt?: Date }
) {
  return prisma.chat.update({
    where: { id },
    data,
    include: {
      project: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function dbDeleteChat(id: string) {
  return prisma.chat.deleteMany({ where: { id } });
}

export async function dbCreateMessageForChat({
  chatId,
  content,
  role,
}: {
  chatId: string;
  content: string;
  role: MessageRole;
}) {
  return prisma.message.create({ data: { content, role, chatId } });
}

// Project mutations
export async function dbCreateProject(data: {
  name: string;
  userId: string;
}): Promise<Project> {
  return prisma.project.create({ data });
}

export async function dbUpdateProject(
  id: string,
  data: { name?: string; updatedAt?: Date }
) {
  return prisma.project.update({ where: { id }, data });
}

export async function dbDeleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
