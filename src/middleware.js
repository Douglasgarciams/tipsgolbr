import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Variável JWT_SECRET não encontrada!');
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/login', '/cadastro', '/assinatura'];
  
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get('sessionToken')?.value;
  const loginUrl = new URL('/login', request.url);

  if (!token) return NextResponse.redirect(loginUrl);

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (payload.role === 'ADMIN') return NextResponse.next();
    if (payload.role === 'USER') {
      if (pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/', request.url));
      const isSubscribed = payload.subscriptionStatus === 'ACTIVE' && new Date(payload.subscriptionExpiresAt) > new Date();
      if (!isSubscribed) return NextResponse.redirect(new URL('/assinatura', request.url));
    }
    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('sessionToken');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};