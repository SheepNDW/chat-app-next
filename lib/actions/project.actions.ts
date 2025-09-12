'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Project, ProjectWithChats } from '@/types';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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
): Promise<Project> {
  const session = await auth();
  const userId = session?.user?.dbUserId;
  if (!userId) throw new Error('User not authenticated');

  const trimmed = data.name.trim();
  if (!trimmed) throw new Error('Project name cannot be empty');

  const existing = await prisma.project.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error('Project not found');

  const updated = await prisma.project.update({
    where: { id },
    data: { name: trimmed, updatedAt: new Date() },
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');

  return updated;
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

// Server action usable with useFormState for renaming a project via <form>
// Expects fields: projectId, name
export async function renameProjectAction(
  _prevState: { ok: boolean; name?: string; error?: string } | undefined,
  formData: FormData
): Promise<{ ok: boolean; name?: string; error?: string }> {
  try {
    const projectId = String(formData.get('projectId') || '');
    const name = String(formData.get('name') || '').trim();
    if (!projectId) return { ok: false, error: 'Missing project id' };
    if (!name) return { ok: false, error: 'Name cannot be empty' };
    const updated = await updateProject(projectId, { name });
    return { ok: true, name: updated.name };
  } catch (e: any) {
    return { ok: false, error: e.message || 'Rename failed' };
  }
}
