import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const shop = url.searchParams.get('shop');
  
  // Skip middleware for auth routes, webhooks, and static files
  if (
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/webhooks') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // For the main app, ensure we have shop parameter
  if (url.pathname === '/' && !shop) {
    // Redirect to install page or show shop input
    return NextResponse.redirect(new URL('/install', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 