'use client';

import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Chat } from '@/types';
import Link from 'next/link';

interface ProjectChatItemProps {
  projectId: string;
  chat: Chat;
  isActive: boolean;
}

export function ProjectChatItem({
  projectId,
  chat,
  isActive,
}: ProjectChatItemProps) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link href={{ pathname: `/projects/${projectId}/chats/${chat.id}` }}>
          <span>{chat.title || 'Untitled Chat'}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
