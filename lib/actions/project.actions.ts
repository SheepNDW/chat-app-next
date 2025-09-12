'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Project, ProjectWithChats } from '@/types';
import { redirect } from 'next/navigation';

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

export async function createProject(data: { name: string }): Promise<Project> {
  const session = await auth();
  const userId = session?.user?.dbUserId;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  return await prisma.project.create({
    data: {
      name: data.name,
      userId,
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

export async function createProjectAndRedirect(options: { name: string }) {
  const project = await createProject({ name: options.name });

  if (!project || !project.id) {
    throw new Error('Failed to create project');
  }

  redirect(`/projects/${project.id}`);
}
