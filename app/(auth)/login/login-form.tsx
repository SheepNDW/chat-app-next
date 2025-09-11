'use client';

import { Button } from '@/components/ui/button';
import { Github } from '@/components/ui/github';
import { githubSignIn } from '@/lib/actions/user.action';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export default function LoginForm() {
  const LoginSubmitButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button
        size="lg"
        type="submit"
        className="gap-2 cursor-pointer disabled:cursor-not-allowed"
        disabled={pending}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github />}
        {pending ? 'Signing in...' : 'Continue with GitHub'}
      </Button>
    );
  };

  return (
    <form action={githubSignIn} className="space-y-4">
      <LoginSubmitButton />
    </form>
  );
}
