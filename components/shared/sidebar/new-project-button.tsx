'use client';

import { Button } from '@/components/ui/button';
import { createProjectAndRedirect } from '@/lib/actions/project.actions';
import { FolderPlus } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export default function NewProjectButton() {
  const NewButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="w-full"
        disabled={pending}
      >
        <FolderPlus className="h-4 w-4" />
        New Project
      </Button>
    );
  };

  return (
    <form
      action={async () => createProjectAndRedirect({ name: 'New Project' })}
    >
      <NewButton />
    </form>
  );
}
