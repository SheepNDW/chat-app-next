'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { renameProject } from '@/lib/actions/project.actions';
import { cn } from '@/lib/utils';
import { Check, Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(name);
  }, [name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  async function submit() {
    if (!isEditing) return;
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      setIsEditing(false);
      setValue(name);
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await renameProject({ projectId, name: trimmed });
      onRenamed?.(trimmed);
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || 'Rename failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancel() {
    setIsEditing(false);
    setValue(name);
    setError(null);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  }

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
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={isSubmitting}
        className="h-9 text-lg"
      />
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          type="button"
          disabled={isSubmitting}
          onClick={cancel}
          aria-label="Cancel rename"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          type="button"
          disabled={isSubmitting}
          onClick={submit}
          aria-label="Confirm rename"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
      {error && <span className="text-xs text-destructive ml-1">{error}</span>}
    </div>
  );
}
