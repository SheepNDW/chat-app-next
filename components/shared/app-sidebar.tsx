'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppSidebarProps {
  isOpen: boolean;
}

// Mock data types - these will be replaced with actual types later
interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  projectId?: string;
}

interface Project {
  id: string;
  name: string;
}

export default function AppSidebar({ isOpen }: AppSidebarProps) {
  const pathname = usePathname();

  // Mock data - this will be replaced with actual data fetching
  const projects: Project[] = [];
  const chats: Chat[] = [];

  const handleCreateProject = async () => {
    // TODO: Implement project creation logic
    console.log('Creating new project...');
  };

  const handleCreateChat = async () => {
    // TODO: Implement chat creation logic
    console.log('Creating new chat...');
  };

  const chatsWithoutProject = chats.filter((c) => !c.projectId);

  const filterChatsByDateRange = (
    chats: Chat[],
    startDays: number,
    endDays?: number
  ) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - startDays * 24 * 60 * 60 * 1000);
    const endDate = endDays
      ? new Date(now.getTime() - endDays * 24 * 60 * 60 * 1000)
      : new Date(0);

    return chats.filter((chat) => {
      const chatDate = new Date(chat.createdAt);
      return chatDate >= endDate && chatDate <= startDate;
    });
  };

  const todayChats = filterChatsByDateRange(chatsWithoutProject, -1, 1);
  const lastWeekChats = filterChatsByDateRange(chatsWithoutProject, 1, 7);
  const lastMonthChats = filterChatsByDateRange(chatsWithoutProject, 7, 30);
  const olderChats = filterChatsByDateRange(chatsWithoutProject, 30);

  const renderChatList = (chats: Chat[], title: string) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {title}
          </h2>
        </div>
        <nav className="space-y-1">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}` as any}
              className={cn(
                'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === `/chats/${chat.id}` &&
                  'bg-accent text-accent-foreground'
              )}
            >
              {chat.title || 'Untitled Chat'}
            </Link>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed top-16 left-0 bottom-0 w-64 transition-transform duration-300 z-40 bg-muted border-r border-border',
        !isOpen && '-translate-x-full'
      )}
    >
      {projects.length > 0 && (
        <div className="mb-4 overflow-auto p-4 border-b border-border">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Projects
            </h2>
          </div>
          <nav className="space-y-1 mb-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}` as any}
                className={cn(
                  'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === `/projects/${project.id}` &&
                    'bg-accent text-accent-foreground'
                )}
              >
                {project.name}
              </Link>
            ))}
          </nav>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={handleCreateProject}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      )}

      {chatsWithoutProject.length > 0 ? (
        <div className="overflow-y-auto p-4">
          {renderChatList(todayChats, 'Today')}
          {renderChatList(lastWeekChats, 'Last 7 Days')}
          {renderChatList(lastMonthChats, 'Last 30 Days')}
          {renderChatList(olderChats, 'Older')}
        </div>
      ) : (
        <div className="overflow-y-auto p-4">
          <Alert>
            <AlertTitle>No Chats</AlertTitle>
            <AlertDescription>
              Create a new chat to get started.
            </AlertDescription>
          </Alert>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full"
            onClick={handleCreateChat}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      )}
    </aside>
  );
}
