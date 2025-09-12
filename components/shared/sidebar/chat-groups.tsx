'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { Chat } from '@/types';
import { useParams } from 'next/navigation';
import ChatNavItem from './chat-navItem';

interface ChatGroupsProps {
  grouped: {
    label: string;
    chats: Chat[];
  }[];
  basePath?: string; // default root chats path
}

export default function ChatGroups({
  grouped,
  basePath = '/chats',
}: ChatGroupsProps) {
  const params = useParams();
  const currentChatId = params.id as string | undefined;

  if (!grouped.some((g) => g.chats.length)) return null;

  return (
    <div className="overflow-y-auto">
      {grouped.map(
        (group) =>
          group.chats.length > 0 && (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.chats.map((chat) => (
                    <ChatNavItem
                      key={chat.id}
                      href={`${basePath}/${chat.id}`}
                      label={chat.title || 'Untitled Chat'}
                      active={currentChatId === chat.id}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
      )}
    </div>
  );
}
