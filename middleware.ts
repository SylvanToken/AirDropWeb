import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Özel erişim anahtarı - Environment variable'dan alınır
const SECRET_ACCESS_KEY = process.env.TEST_ACCESS_KEY || 
  (process.env.NODE_ENV === 'development' 
    ? '07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c'
    : null);

// Production'da TEST_ACCESS_KEY zorunlu
if (!SECRET_ACCESS_KEY && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: TEST_ACCESS_KEY environment variable is not set in production!');
}

// Cookie configuration
const COOKIE_NAME = 'sylvan_test_access';
const COOKIE_VALUE = 'granted';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function middleware(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl;
    
    // Countdown page - always allow access
    if (pathname === '/countdown') {
      return NextResponse.next();
    }
    
    // Root path kontrolü
    if (pathname === '/') {
      const accessKey = searchParams.get('access');
      
      // Özel key varsa ve doğruysa, cookie set et ve dashboard'a yönlendir
      if (accessKey && SECRET_ACCESS_KEY && accessKey === SECRET_ACCESS_KEY) {
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        
        // Cookie ile erişimi kaydet (7 gün)
        response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
          maxAge: COOKIE_MAX_AGE,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        });
        
        console.log('Admin access granted via access key');
        return response;
      }
      
      // Cookie'de erişim varsa, dashboard'a yönlendir
      const hasAccess = request.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
      if (hasAccess) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Erişim yoksa, geri sayaç sayfasına yönlendir
      return NextResponse.redirect(new URL('/countdown', request.url));
    }
    
    // Diğer sayfalar için cookie kontrolü (dashboard, tasks, profile, vb.)
    if (pathname !== '/countdown' && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const hasAccess = request.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
      if (!hasAccess) {
        console.log(`Access denied to ${pathname}, redirecting to countdown`);
        // Erişim yoksa countdown sayfasına yönlendir
        return NextResponse.redirect(new URL('/countdown', request.url));
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    // Error handling - log and fail open for availability
    console.error('Middleware error:', {
      path: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Fail open - allow request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     * - images (public images)
     * - avatars (public avatars)
     * - docs (public docs)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|images|avatars|docs|manifest.json|sw.js).*)',
  ],
}
