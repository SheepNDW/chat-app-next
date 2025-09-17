'use client';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ChatNavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  icon?: ReactNode;
  shallow?: boolean;
}

export default function ChatNavItem({
  href,
  label,
  isActive,
  icon,
  shallow,
}: ChatNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={{ pathname: href }} shallow={shallow}>
          {icon ? (
            <span className="mr-2 inline-flex items-center">{icon}</span>
          ) : null}
          <span className="truncate">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
