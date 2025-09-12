import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Variável JWT_SECRET não encontrada!');
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 👇 ADICIONE ESTA LÓGICA PARA TRATAR A ROTA
  // Remove a barra final, a menos que seja a única barra (rota raiz)
  const normalizedPathname = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;

  // ALTERADO AQUI: Adicionado '/contato' às rotas públicas
  const publicRoutes = ['/login', '/cadastro', '/assinatura', '/forgot-password', '/reset-password', '/aulas', '/contato']; 

  // Se a rota for pública, deixa passar direto
  if (publicRoutes.includes(normalizedPathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('sessionToken')?.value;
  const loginUrl = new URL('/login', request.url);

  // Se não há token, redireciona para login
  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    if (payload.role === 'ADMIN') {
      return NextResponse.next();
    }

    if (payload.role === 'USER') {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      const isSubscribed = payload.subscriptionStatus === 'ACTIVE' && new Date(payload.subscriptionExpiresAt) > new Date();
      if (!isSubscribed) {
        return NextResponse.redirect(new URL('/assinatura', request.url));
      }
    }
    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('sessionToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.css$|.*\\.js$|.*\\.map$|.*\\.webp$).*)',
  ],
};