import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import type { Provider } from 'next-auth/providers/index';
import { randomBytes } from 'crypto';
import { hashPassword } from '@/lib/password';
import { ROLES } from '@/lib/roles';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

const providers: Provider[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Credenciales inválidas');
      }

      const email = credentials.email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      if (user.status !== 'ACTIVE') {
        throw new Error('Cuenta deshabilitada');
      }

      const isValid = await verifyPassword(credentials.password, user.password);
      if (!isValid) {
        throw new Error('Credenciales inválidas');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    '[auth] NEXTAUTH_SECRET no está configurado. Define un secreto fuerte en producción.'
  );
}

export const authOptions: AuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return true;
      // OAuth (GitHub): vincular/crear el usuario en la BD por email
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return existing.status === 'ACTIVE';
      await prisma.user.create({
        data: {
          email,
          name: user.name || email.split('@')[0],
          password: await hashPassword(randomBytes(32).toString('hex')),
          role: ROLES.STUDENT,
          status: 'ACTIVE',
          avatar: user.image ?? null,
          emailVerified: new Date(),
        },
      });
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user && account?.provider === 'credentials') {
        token.id = user.id;
        token.role = user.role;
      } else if (user && account) {
        // OAuth: el id del proveedor no es el id de la BD
        const email = user.email?.trim().toLowerCase();
        const dbUser = email
          ? await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, status: true } })
          : null;
        if (!dbUser || dbUser.status !== 'ACTIVE') {
          token.id = undefined;
          token.role = undefined;
          return token;
        }
        token.id = dbUser.id;
        token.role = dbUser.role;
      }

      if (token.id && (trigger === 'update' || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true },
        });

        if (!dbUser || dbUser.status !== 'ACTIVE') {
          token.role = undefined;
          token.id = undefined;
          return token;
        }

        token.role = dbUser.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (!token.id || !token.role) {
          return { ...session, user: { ...session.user, id: '', role: '' } };
        }
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
