'use client';

import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { Menu, Plus } from 'lucide-react';
import ModeToggle from './mode-toggle';

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const handleCreateChat = async () => {
    // TODO: Implement chat creation and navigation logic
    console.log('Creating new chat...');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Button onClick={handleCreateChat} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

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
