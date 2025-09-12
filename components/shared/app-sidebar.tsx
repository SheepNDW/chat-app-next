'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { filterChatsByDateRange } from '@/lib/utils';
import { Chat, Project } from '@/types';
import ChatGroups from './sidebar/chat-groups';
import NewChatButton from './sidebar/new-chat-button';
import NewProjectButton from './sidebar/new-project-button';
import ProjectList from './sidebar/project-list';

export default function AppSidebar({
  chats,
  projects,
}: {
  chats: Chat[];
  projects: Project[];
}) {
  const chatsWithoutProject = chats.filter((c) => c.projectId === null);

  function filteredChats(startDays: number, endDays?: number) {
    return filterChatsByDateRange(chatsWithoutProject, startDays, endDays);
  }

  const grouped = [
    { label: 'Today', chats: filteredChats(-1, 1) },
    { label: 'Last Week', chats: filteredChats(1, 7) },
    { label: 'Last Month', chats: filteredChats(7, 30) },
    { label: 'Older Chats', chats: filteredChats(30) },
  ];

  return (
    <Sidebar>
      <SidebarContent className="overflow-y-auto p-4">
        <NewProjectButton />

        {projects.length > 0 ? (
          <ProjectList projects={projects} chats={chats} />
        ) : (
          <>
            <Alert className="mb-4">
              <AlertTitle>No Projects</AlertTitle>
              <AlertDescription>
                Create a new project to organize your chats.
              </AlertDescription>
            </Alert>
          </>
        )}

        <NewChatButton />

        {chatsWithoutProject.length > 0 ? (
          <ChatGroups grouped={grouped} />
        ) : (
          <Alert>
            <AlertTitle>No Chats</AlertTitle>
            <AlertDescription>
              Create a new chat to get started.
            </AlertDescription>
          </Alert>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
