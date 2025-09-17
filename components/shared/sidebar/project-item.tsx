'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar';
import { Chat, Project } from '@/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProjectChatItem } from './project-chat-item';

interface ProjectItemProps {
  project: Project;
  chats: Chat[];
  currentProjectId?: string;
  currentChatId?: string;
}

export function ProjectItem({
  project,
  chats,
  currentProjectId,
  currentChatId,
}: ProjectItemProps) {
  const isCurrentProject = currentProjectId === project.id;
  const isProjectRootActive = isCurrentProject && !currentChatId;

  return (
    <Collapsible
      asChild
      open={isCurrentProject}
      key={project.id}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <Link href={{ pathname: `/projects/${project.id}` }}>
            <SidebarMenuButton
              tooltip={project.name}
              isActive={isProjectRootActive}
            >
              <span>{project.name}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </Link>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {isCurrentProject &&
              chats.map((chat) => (
                <ProjectChatItem
                  key={chat.id}
                  projectId={project.id}
                  chat={chat}
                  isActive={currentChatId === chat.id}
                />
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
