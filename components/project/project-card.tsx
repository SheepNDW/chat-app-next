import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ProjectWithChats } from '@/types';
import Link from 'next/link';

export default function ProjectCard({
  projectId,
  chat,
  className,
}: {
  projectId: string;
  chat: ProjectWithChats['chats'][number];
  className?: string;
  showPreview?: boolean;
}) {
  const firstMessage = chat.messages[0];

  return (
    <Link
      href={`/projects/${projectId}/chats/${chat.id}`}
      className={cn('block h-full', className)}
    >
      <Card className="h-full gap-4">
        <CardHeader>
          <CardTitle>{chat.title || 'Untitled Chat'}</CardTitle>
        </CardHeader>
        <Separator />
        {firstMessage && (
          <CardContent>
            <p className="text-sm line-clamp-2 text-muted-foreground">
              {firstMessage.content}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
