import { SidebarTrigger } from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/constants';
import ModeToggle from './header/mode-toggle';
import ProfileMenu from './header/ProfileMenu';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { createChatAndRedirect } from '@/lib/actions/chat.actions';

export default function AppHeader() {
  return (
    <header className="sticky w-full top-0 h-16 border-b border-border flex items-center justify-between px-4 z-50 dark:bg-sidebar">
      <div className="flex items-center gap-2">
        <SidebarTrigger />

        <form
          action={async () => {
            'use server';
            createChatAndRedirect();
          }}
        >
          <Button type="submit" size="sm">
            <Plus className="h-2 w-2" />
            New Chat
          </Button>
        </form>
      </div>

      <h1 className="text-lg font-semibold">{APP_NAME}</h1>

      <div className="flex items-center gap-4">
        <ModeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
