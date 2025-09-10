'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectHeader({
  projectName,
}: {
  projectName: string;
}) {
  const { projectId, id } = useParams();

  return (
    <div className="flex items-start justify-between mb-6 pb-4 border-b">
      <div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">
              {projectName}
            </h2>
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
      <Button>
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
    </div>
  );
}
