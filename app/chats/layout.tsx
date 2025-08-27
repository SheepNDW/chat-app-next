'use client';

import { useState } from 'react';
import AppHeader from '@/components/shared/app-header';
import AppSidebar from '@/components/shared/app-sidebar';

export default function RootPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-background dark:bg-muted">
      <AppHeader onToggleSidebar={handleToggleSidebar} />
      <AppSidebar isOpen={isSidebarOpen} />
      <main
        className={`transition-all duration-300 ease-in-out h-full mt-16 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
