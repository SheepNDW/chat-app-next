'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/constants';
import ModeToggle from './mode-toggle';

export default function AppHeader() {
  return (
    <header className="sticky w-full top-0 h-16 border-b border-border flex items-center justify-between px-4 z-50 dark:bg-sidebar">
      <SidebarTrigger />

      <h1 className="text-lg font-semibold">{APP_NAME}</h1>

      <div className="flex items-center gap-4">
        <ModeToggle />

        {/* TODO: Add ProfileMenu component */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-medium">U</span>
        </div>
      </div>
    </header>
  );
}
