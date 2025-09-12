'use client';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ChatNavItemProps {
  href: string;
  label: string;
  active?: boolean;
  icon?: ReactNode;
  shallow?: boolean;
  className?: string; // extra classes for the root SidebarMenuItem
}

export default function ChatNavItem({
  href,
  label,
  active,
  icon,
  shallow,
  className,
}: ChatNavItemProps) {
  return (
    <SidebarMenuItem className={cn(active && 'bg-muted rounded-md', className)}>
      <SidebarMenuButton asChild>
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
