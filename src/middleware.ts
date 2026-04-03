import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.includes('/admin') && !pathname.includes('/admin/login')) {
    const session = request.cookies.get('admin_session');
    if (!session?.value) {
      const loginUrl = new URL(pathname.replace(/\/admin.*/, '/admin/login'), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ru|kg|en)/:path*'],
};
