'use server';

import { prisma } from '@/lib/prisma';
import type { Project, ProjectWithChats } from '@/types';

export async function getAllProjects(): Promise<Project[]> {
  return await prisma.project.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function getAllProjectsByUser(userId: string): Promise<Project[]> {
  return await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getProjectById(
  id: string
): Promise<ProjectWithChats | null> {
  return await prisma.project.findFirst({
    where: { id },
    include: {
      chats: {
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });
}

export async function getProjectByIdForUser(
  id: string,
  userId: string
): Promise<Project | null> {
  return await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function createProject(data: {
  name: string;
  userId: string;
}): Promise<Project> {
  return await prisma.project.create({
    data: {
      name: data.name,
      userId: data.userId,
    },
  });
}

export async function updateProject(
  id: string,
  data: { name: string }
): Promise<Project | null> {
  return await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      updatedAt: new Date(),
    },
  });
}

export async function deleteProject(id: string) {
  return await prisma.project.delete({
    where: { id },
  });
}
