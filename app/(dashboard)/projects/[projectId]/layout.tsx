import ProjectHeader from '@/components/project/project-header';
import { getProjectById } from '@/lib/actions/project.actions';

export default async function ProjectsLayout({
  children,
  params,
}: LayoutProps<'/projects/[projectId]'>) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  return (
    <div className="flex flex-col p-4 h-[calc(100%-4rem)]">
      <ProjectHeader projectName={project?.name || 'Untitled Project'} />
      {children}
    </div>
  );
}
