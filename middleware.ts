import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { isAdminRole, isTeacherOrAbove } from '@/lib/roles';

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && !isAdminRole(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (path.startsWith('/teacher') && !isTeacherOrAbove(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: '/login' },
    callbacks: {
      authorized: ({ token }) => Boolean(token?.id && token?.role),
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/teacher/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/achievements/:path*',
  ],
};
