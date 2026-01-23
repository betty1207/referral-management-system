import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role-based route protection
const roleRoutes: Record<string, string[]> = {
  doctor: ['/dashboard/doctor'],
  liaison: ['/dashboard/liaison'],
  'hospital-admin': ['/dashboard/hospital-admin'],
  'system-admin': ['/dashboard/system-admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/forgot-password', '/verify'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If accessing a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // TODO: Add role-based access control
  // You'll need to decode the JWT token and check user role
  // For now, this is a basic structure

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

