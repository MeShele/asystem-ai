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

  // Partner panel auth guard (dashboard, clients, settings — NOT /partner or /partner/login)
  const partnerProtected = /\/(ru|en|kg)\/partner\/(dashboard|clients|settings)/.test(pathname);
  if (partnerProtected) {
    const session = request.cookies.get('partner_session');
    if (!session?.value) {
      const loginUrl = new URL(pathname.replace(/\/partner\/.*/, '/partner/login'), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ru|kg|en)/:path*'],
};
