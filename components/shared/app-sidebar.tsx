import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';

export default function AppSidebar() {
  return (
    <Sidebar>
      <div className="overflow-y-auto p-4">
        <Alert>
          <AlertTitle>No Chats</AlertTitle>
          <AlertDescription>Create a new chat to get started.</AlertDescription>
        </Alert>
        <Button size="sm" variant="outline" className="mt-4 w-full">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
    </Sidebar>
  );
}
