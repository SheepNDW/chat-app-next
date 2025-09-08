import AppHeader from '@/components/shared/app-header';
import AppSidebar from '@/components/shared/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function RootPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="h-[calc(100vh-4rem)] dark:bg-muted">
          <main className="h-full">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
