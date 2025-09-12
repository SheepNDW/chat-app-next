'use client';

import { Button } from '@/components/ui/button';
import { createChatAndRedirect } from '@/lib/actions/chat.actions';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProjectTitle } from './project-title';

export default function ProjectHeader({
  projectName,
}: {
  projectName: string;
}) {
  const { projectId, id } = useParams();

  async function createNewChat() {
    if (!projectId) return;
    createChatAndRedirect({ projectId: String(projectId) });
  }

  return (
    <div className="flex items-start justify-between mb-6 pb-4 border-b">
      <div>
        <div>
          <div className="flex items-center gap-2">
            <ProjectTitle
              projectId={String(projectId)}
              name={projectName}
              canEdit={!id}
            />
          </div>
          {id && (
            <Link
              href={`/projects/${projectId}`}
              className="leading-4 flex items-center mt-2 text-sm text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Project
            </Link>
          )}
        </div>
      </div>
      {!id && (
        <form action={createNewChat}>
          <Button>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </form>
      )}
    </div>
  );
}
