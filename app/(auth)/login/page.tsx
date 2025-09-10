import { auth } from '@/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default async function Page(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || '/');
  }

  return (
    <Card className="w-full max-w-[400px] text-center">
      <CardHeader>
        <h1 className="text-2xl font-bold">Welcome to {'AI Chat'}</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to continue to your chats
        </p>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
