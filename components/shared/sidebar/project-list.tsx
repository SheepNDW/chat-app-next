'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Chat, Project } from '@/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export interface ProjectListProps {
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
        {projects.map((project) => {
          const isCurrent = currentProjectId === project.id;
          const projectSpecificChats = isCurrent
            ? projectChats(project.id)
            : [];

          return (
            <Collapsible
              key={project.id}
              asChild
              defaultOpen={isCurrent}
              className="group/collapsible"
            >
              <SidebarMenuItem
                className={isCurrent ? 'bg-muted rounded-md' : ''}
              >
                <CollapsibleTrigger asChild>
                  <Link href={{ pathname: `/projects/${project.id}` }}>
                    <SidebarMenuButton tooltip={project.name}>
                      <span>{project.name}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </Link>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {projectSpecificChats.map((chat) => (
                      <SidebarMenuSubItem key={chat.id}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href={{
                              pathname: `/projects/${project.id}/chats/${chat.id}`,
                            }}
                          >
                            <span
                              className={
                                currentChatId === chat.id
                                  ? 'font-medium'
                                  : undefined
                              }
                            >
                              {chat.title || 'Untitled Chat'}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
