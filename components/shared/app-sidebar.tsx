'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { filterChatsByDateRange } from '@/lib/utils';
import { Chat, Project } from '@/types';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface NavigationMenuItem {
  label: string;
  to: string;
  active: boolean;
  defaultOpen?: boolean;
  children?: NavigationMenuItem[];
}

export default function AppSidebar({
  chats,
  projects,
}: {
  chats: Chat[];
  projects: Project[];
}) {
  const params = useParams();

  function isCurrentProject(projectId: string) {
    return params.projectId === projectId;
  }

  const chatsInCurrentProject = chats.filter(
    (chat) => chat.projectId === params.projectId
  );
  const chatsWithoutProject = chats.filter((c) => c.projectId === null);

  function formatProjectChat(project: Project, chat: Chat): NavigationMenuItem {
    return {
      label: chat.title || 'Untitled Chat',
      to: `/projects/${project.id}/chats/${chat.id}`,
      active: params.id === chat.id,
    };
  }
  function formatProjectItem(project: Project): NavigationMenuItem {
    const isCurrent = isCurrentProject(project.id);

    const baseItem: NavigationMenuItem = {
      label: project.name,
      to: `/projects/${project.id}`,
      active: isCurrent,
      defaultOpen: isCurrent,
    };

    if (isCurrent) {
      return {
        ...baseItem,
        children: chatsInCurrentProject.map((chat) =>
          formatProjectChat(project, chat)
        ),
      };
    }

    return baseItem;
  }
  const projectItems = projects?.map(formatProjectItem) || [];

  function formatChatItem(chat: Chat): NavigationMenuItem {
    return {
      label: chat.title || 'Untitled Chat',
      to: `/chats/${chat.id}`,
      active: params.id === chat.id,
    };
  }

  function useFilteredChats(startDays: number, endDays?: number) {
    return filterChatsByDateRange(chatsWithoutProject, startDays, endDays).map(
      formatChatItem
    );
  }

  const todayChats = useFilteredChats(-1, 1);
  const lastWeekChats = useFilteredChats(1, 7);
  const lastMonthChats = useFilteredChats(7, 30);
  const olderChats = useFilteredChats(30);

  return (
    <Sidebar>
      <SidebarContent className="overflow-y-auto p-4">
        {projectItems.length > 0 && (
          <div className="mb-4 overflow-auto p-4 border-b">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">
              Projects
            </h2>
            <SidebarMenu>
              {projectItems.map((item) => (
                <Collapsible
                  key={item.to}
                  asChild
                  defaultOpen={item.defaultOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem
                    className={item.active ? 'bg-muted rounded-md' : ''}
                  >
                    <CollapsibleTrigger asChild>
                      <Link href={{ pathname: item.to }}>
                        <SidebarMenuButton tooltip={item.label}>
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </Link>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.to}>
                            <SidebarMenuSubButton asChild>
                              <Link href={{ pathname: subItem.to }}>
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>

            <Button size="sm" variant="outline" className="mt-4 w-full">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        )}

        {chatsWithoutProject.length > 0 ? (
          <div className="overflow-y-auto">
            {todayChats.length > 0 && (
              <>
                <SidebarGroup>
                  <SidebarGroupLabel>Today</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {todayChats.map((item) => (
                        <SidebarMenuItem
                          key={item.to}
                          className={item.active ? 'bg-muted rounded-md' : ''}
                        >
                          <SidebarMenuButton asChild>
                            <Link href={{ pathname: item.to }}>
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}

            {lastWeekChats.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Last Week</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {lastWeekChats.map((item) => (
                      <SidebarMenuItem
                        key={item.to}
                        className={item.active ? 'bg-muted rounded-md' : ''}
                      >
                        <SidebarMenuButton asChild>
                          <Link href={{ pathname: item.to }}>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {lastMonthChats.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Last Month</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {lastMonthChats.map((item) => (
                      <SidebarMenuItem
                        key={item.to}
                        className={item.active ? 'bg-muted rounded-md' : ''}
                      >
                        <SidebarMenuButton asChild>
                          <Link href={{ pathname: item.to }}>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {olderChats.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Older Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {olderChats.map((item) => (
                      <SidebarMenuItem
                        key={item.to}
                        className={item.active ? 'bg-muted rounded-md' : ''}
                      >
                        <SidebarMenuButton asChild>
                          <Link href={{ pathname: item.to }}>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </div>
        ) : (
          <>
            <Alert>
              <AlertTitle>No Chats</AlertTitle>
              <AlertDescription>
                Create a new chat to get started.
              </AlertDescription>
            </Alert>
            <Button size="sm" variant="outline" className="mt-4 w-full">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
