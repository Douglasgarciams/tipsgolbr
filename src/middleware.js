import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Variável JWT_SECRET não encontrada!');
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ROTAS PÚBLICAS (que não exigem login)
  const publicRoutes = ['/login', '/cadastro', '/assinatura']; 

  // Se a rota for pública, deixa passar direto
  if (publicRoutes.includes(pathname)) {
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

    // Se for ADMIN, deixa passar para qualquer lugar
    if (payload.role === 'ADMIN') {
      return NextResponse.next();
    }

    // Se for USER, verifica assinatura e não permite acesso a /admin
    if (payload.role === 'USER') {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url)); // Redireciona user de /admin para home
      }
      const isSubscribed = payload.subscriptionStatus === 'ACTIVE' && new Date(payload.subscriptionExpiresAt) > new Date();
      if (!isSubscribed) {
        return NextResponse.redirect(new URL('/assinatura', request.url)); // Redireciona user sem assinatura
      }
    }
    return NextResponse.next(); // Usuário logado e permitido, segue
  } catch (err) {
    // Se o token for inválido/expirado, redireciona para login e apaga cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('sessionToken');
    return response;
  }
}

export const config = {
  // NOVO MATCHER: Exclui APIs, _next, favicon.ico e agora também arquivos com extensões de imagem, css, js etc.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.css$|.*\\.js$|.*\\.map$|.*\\.webp$).*)',
  ],
};