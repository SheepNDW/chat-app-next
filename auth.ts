import NextAuth from 'next-auth';
import github from 'next-auth/providers/github';
import { findOrCreateUser, findUserByProviderId } from '@/lib/user-tools';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    github({
      authorization: { params: { scope: 'read:user user:email' } },
    }),
  ],
  callbacks: {
    /** Persist or find the user in our own User table */
    async signIn({ profile }) {
      if (!profile) return false;
      try {
        const gh: any = profile;
        const githubUser = {
          id: gh.id,
          login: gh.login,
          name: gh.name ?? gh.login,
          email: gh.email ?? '',
          avatar: gh.avatar_url || gh.avatar || '',
        };
        await findOrCreateUser(githubUser);
        return true;
      } catch (e) {
        console.error('signIn callback error', e);
        return false;
      }
    },
    /** Add user id into JWT */
    async jwt({ token, profile }) {
      if (profile?.id) {
        token.uid = String(profile.id);

        const user = await findUserByProviderId(String(profile.id));
        if (user) {
          token.dbUserId = user.id;
        }
      }
      return token;
    },
    /** Expose user id on session */
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as any).id = token.uid;
        session.user.dbUserId = token.dbUserId as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
