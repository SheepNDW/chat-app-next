import AppHeader from '@/components/shared/app-header';
import AppSidebar from '@/components/shared/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getAllChats } from '@/lib/actions/chat.actions';
import { getAllProjects } from '@/lib/actions/project.actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chats = await getAllChats();
  const projects = await getAllProjects();

  return (
    <SidebarProvider>
      <AppSidebar chats={chats} projects={projects} />
      <div className="w-full">
        <AppHeader />
        <div className="h-[calc(100vh-4rem)] dark:bg-muted">
          <main className="h-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
