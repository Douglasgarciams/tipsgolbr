// src/middleware.js --- VERSÃO FINAL, CORRIGIDA E ROBUSTA

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Variável de ambiente JWT_SECRET não foi configurada!');
  }
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sessionToken')?.value;
  const loginUrl = new URL('/login', request.url);

  // Tenta verificar o token para saber se o usuário está logado e pegar seus dados
  let payload;
  try {
    if (token) {
      const verified = await jwtVerify(token, getJwtSecretKey());
      payload = verified.payload;
    }
  } catch (err) {
    // Se o token for inválido, apaga o cookie e redireciona para o login
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('sessionToken');
    return response;
  }
  
  const isLoggedIn = !!payload;
  const userRole = payload?.role;

  // REGRA 1: Se um usuário JÁ LOGADO tenta acessar /login ou /cadastro,
  // redireciona ele para a página principal.
  if (isLoggedIn && (pathname.startsWith('/login') || pathname.startsWith('/cadastro'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // REGRA 2: Se um usuário NÃO ESTÁ LOGADO e tenta acessar uma página protegida,
  // redireciona ele para o login.
  if (!isLoggedIn && (pathname.startsWith('/admin') || pathname === '/')) {
    return NextResponse.redirect(loginUrl);
  }

  // REGRA 3: Se o usuário está LOGADO, verificamos as permissões
  if (isLoggedIn) {
    // Se for um USER tentando acessar o /admin, nega e manda para a home.
    if (userRole === 'USER' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Se for um USER tentando acessar a home DE PALPITES, verifica a assinatura.
    if (userRole === 'USER' && pathname === '/') {
      const isSubscriptionActive = 
        payload.subscriptionStatus === 'ACTIVE' && 
        new Date(payload.subscriptionExpiresAt) > new Date();
      
      // Substitua pelo bloco abaixo
if (!isSubscriptionActive) {
  // Se a assinatura não estiver ativa...
  const assinaturaUrl = new URL('/assinatura', request.url);
  const response = NextResponse.redirect(assinaturaUrl);

  // AQUI ESTÁ A MÁGICA: mandamos o navegador apagar o cookie inválido
  response.cookies.delete('sessionToken');

  return response;
}
    }
  }

  // Se nenhuma das regras de redirecionamento acima foi acionada,
  // (ex: um admin acessando /admin, ou um user com assinatura ativa acessando a home),
  // permite o acesso.
  return NextResponse.next();
}

export const config = {
  // O middleware vai rodar em todas as rotas principais
  matcher: ['/', '/login', '/cadastro', '/assinatura', '/admin/:path*'],
};