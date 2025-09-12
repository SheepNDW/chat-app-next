'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { renameProjectAction } from '@/lib/actions/project.actions';
import { cn } from '@/lib/utils';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

interface ProjectTitleProps {
  projectId: string;
  name: string;
  canEdit?: boolean;
  onRenamed?: (newName: string) => void;
  className?: string;
}

export function ProjectTitle({
  projectId,
  name,
  canEdit = true,
  onRenamed,
  className,
}: ProjectTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [formState, formAction] = useActionState(
    renameProjectAction,
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(name);
  }, [name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  async function submitViaClient() {
    if (!isEditing) return;
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      setIsEditing(false);
      setValue(name);
      return;
    }
    // Use startTransition to allow optimistic UI (close editor immediately)
    startTransition(() => {
      const fd = new FormData();
      fd.append('projectId', projectId);
      fd.append('name', trimmed);
      formAction(fd);
    });
  }

  function cancel() {
    setIsEditing(false);
    setValue(name);
    setError(null);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitViaClient();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  }

  useEffect(() => {
    if (formState?.ok) {
      // Sync local name & exit edit mode
      if (formState.name) {
        onRenamed?.(formState.name);
        setValue(formState.name);
      }
      setIsEditing(false);
      setError(null);
    } else if (formState?.error) {
      setError(formState.error);
    }
  }, [formState, onRenamed]);

  if (!isEditing) {
    return (
      <h2
        className={cn(
          'text-2xl font-bold text-foreground flex items-center gap-2 group',
          canEdit && 'cursor-pointer',
          className
        )}
        onClick={() => canEdit && setIsEditing(true)}
      >
        {value}
        {canEdit && (
          <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-60 transition" />
        )}
      </h2>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault();
        submitViaClient();
      }}
      className={cn('flex items-center gap-2', className)}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <Input
        ref={inputRef}
        name="name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={isPending}
        className="h-9 text-lg"
      />
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          type="button"
          disabled={isPending}
          onClick={cancel}
          aria-label="Cancel rename"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          type="submit"
          disabled={isPending}
          aria-label="Confirm rename"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && <span className="text-xs text-destructive ml-1">{error}</span>}
    </form>
  );
}
