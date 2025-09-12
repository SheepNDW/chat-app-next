'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { assignChatToProject } from '@/lib/actions/chat.actions';
import { useEffect, useState, useTransition } from 'react';

interface AssignToProjectModalProps {
  chatId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectListItem {
  id: string;
  name: string;
}

export default function AssignToProjectModal({
  chatId,
  open,
  onOpenChange,
}: AssignToProjectModalProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadProjects() {
      if (!open) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('Failed to load projects');
        const data = await res.json();
        setProjects(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [open]);

  function handleClose() {
    onOpenChange(false);
  }

  async function handleAssign(projectId: string) {
    setAssigningId(projectId);
    setError(null);
    try {
      // Using server action directly for redirect (will navigate to project chat path)
      startTransition(async () => {
        await assignChatToProject(chatId, projectId);
      });
    } catch (e: any) {
      setError(e.message || 'Failed to assign');
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to Project</DialogTitle>
          <DialogDescription>
            Choose a project to assign this chat to.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded p-2">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : projects.length ? (
            <ul className="flex flex-col gap-2 max-h-64 overflow-auto">
              {projects.map((p) => (
                <li key={p.id}>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={!!assigningId || isPending}
                    onClick={() => handleAssign(p.id)}
                  >
                    {assigningId === p.id || isPending ? '指派中…' : p.name}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">
              No projects found.
              <p>Create a project first to assign chats to it.</p>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
