import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `Project ${projectId} - AI Chat`,
    description: `Manage AI conversations for project ${projectId}`,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Project {projectId}
              </h1>
              <p className="text-muted-foreground">
                Manage AI conversations for this project
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Project Info Section */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Project ID
                </label>
                <p className="text-lg font-mono">{projectId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-lg">Active</p>
              </div>
            </div>
          </div>

          {/* Chat History Section */}
          <div className="bg-card rounded-lg border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Recent Conversations</h2>
            </div>

            <div className="space-y-3">
              {/* Placeholder for chat list */}
              <div className="flex items-center justify-center py-12 text-center">
                <div>
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first AI conversation for this project
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Conversation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
