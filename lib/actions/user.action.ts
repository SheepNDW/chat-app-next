'use server';

import { signIn, signOut } from '@/auth';

export async function githubSignIn() {
  await signIn('github');
}

export async function signOutUser() {
  await signOut();
}
