import { auth } from '@/auth';
import AppHeader from '@/components/shared/app-header';
import AppSidebar from '@/components/shared/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getAllChatsByUser } from '@/lib/actions/chat.actions';
import { getAllProjectsByUser } from '@/lib/actions/project.actions';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;
  const userId = user?.id || '';

  const [chats, projects] = await Promise.all([
    getAllChatsByUser(userId),
    getAllProjectsByUser(userId),
  ]);

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
