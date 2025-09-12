'use client';

import { Button } from '@/components/ui/button';
import { createChatAndRedirect } from '@/lib/actions/chat.actions';
import { SquarePen } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export default function NewChatButton() {
  const NewButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="mt-4 w-full"
        disabled={pending}
      >
        <SquarePen className="h-4 w-4" />
        New Chat
      </Button>
    );
  };

  return (
    <form action={async () => createChatAndRedirect()}>
      <NewButton />
    </form>
  );
}
