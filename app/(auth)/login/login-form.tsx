'use client';

import { Button } from '@/components/ui/button';
import { Github } from '@/components/ui/github';

export default function LoginForm() {
  return (
    <form action="">
      <Button size="lg">
        <Github />
        {'Continue with GitHub'}
      </Button>
    </form>
  );
}
