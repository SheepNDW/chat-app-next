import { auth } from '@/auth';

/**
 * Ensures there is an authenticated user and returns the userId.
 * Throws if unauthenticated.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.dbUserId;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}
