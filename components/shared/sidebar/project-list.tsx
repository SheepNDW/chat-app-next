'use client';

import { SidebarMenu } from '@/components/ui/sidebar';
import { Chat, Project } from '@/types';
import { useParams } from 'next/navigation';
import { ProjectItem } from './project-item';

interface ProjectListProps {
  projects: Project[];
  chats: Chat[];
}

export default function ProjectList({ projects, chats }: ProjectListProps) {
  const params = useParams();
  const currentProjectId = params.projectId as string | undefined;
  const currentChatId = params.id as string | undefined;

  function projectChats(projectId: string) {
    return chats.filter((c) => c.projectId === projectId);
  }

  if (!projects?.length) return null;

  return (
    <div className="mb-4 overflow-auto p-4 border-b">
      <h2 className="text-sm font-semibold text-muted-foreground mb-2">
        Projects
      </h2>
      <SidebarMenu>
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            chats={projectChats(project.id)}
            currentProjectId={currentProjectId}
            currentChatId={currentChatId}
          />
        ))}
      </SidebarMenu>
    </div>
  );
}
