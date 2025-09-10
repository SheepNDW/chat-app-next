import ProjectCard from '@/components/project/project-card';
import { getProjectById } from '@/lib/actions/project.actions';
import { MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(
  props: PageProps<'/projects/[projectId]'>
): Promise<Metadata> {
  const { projectId } = await props.params;
  const project = await getProjectById(projectId);

  return {
    title: `${project?.name || 'Untitled'}`,
  };
}

export default async function ProjectDetailPage(
  props: PageProps<'/projects/[projectId]'>
) {
  const { projectId } = await props.params;
  const project = await getProjectById(projectId);
  const chats = project?.chats || [];

  return (
    <div>
      {chats.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map((chat) => (
            <ProjectCard key={chat.id} projectId={projectId} chat={chat} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your first AI conversation for this project
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
