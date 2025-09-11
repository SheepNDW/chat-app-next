import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
          404
        </h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It may have been
          moved or no longer exists.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/chats">Go to Chats</Link>
        </Button>
      </div>
    </div>
  );
}
