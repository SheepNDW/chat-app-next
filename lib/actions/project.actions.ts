'use server';

import {
  dbCreateProject,
  dbDeleteProject,
  dbUpdateProject,
} from '@/lib/db/mutations';
import {
  dbGetAllProjectsByUser,
  dbGetProjectById,
  dbGetProjectByIdForUser,
} from '@/lib/db/query';
import type { Project, ProjectWithChats } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUserId } from './auth-helpers';

export async function getAllProjects(): Promise<Project[]> {
  const userId = await requireUserId();
  return dbGetAllProjectsByUser(userId);
}

export async function getAllProjectsByUser(userId: string): Promise<Project[]> {
  return dbGetAllProjectsByUser(userId);
}

export async function getProjectById(
  id: string
): Promise<ProjectWithChats | null> {
  const userId = await requireUserId();
  const project = await dbGetProjectById(id);
  if (!project || project.userId !== userId) return null;
  return project as ProjectWithChats;
}

export async function getProjectByIdForUser(
  id: string,
  userId: string
): Promise<Project | null> {
  return dbGetProjectByIdForUser(id, userId);
}

export async function createProject(data: { name: string }): Promise<Project> {
  const userId = await requireUserId();
  return dbCreateProject({ name: data.name, userId });
}

export async function updateProject(
  id: string,
  data: { name: string }
): Promise<Project> {
  const userId = await requireUserId();

  const trimmed = data.name.trim();
  if (!trimmed) throw new Error('Project name cannot be empty');

  const existing = await dbGetProjectByIdForUser(id, userId);
  if (!existing) throw new Error('Project not found');

  const updated = await dbUpdateProject(id, {
    name: trimmed,
    updatedAt: new Date(),
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');

  return updated;
}

export async function deleteProject(id: string) {
  const userId = await requireUserId();
  const project = await dbGetProjectById(id);
  if (!project || project.userId !== userId)
    throw new Error('Project not found');
  return dbDeleteProject(id);
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
