// src/app/api/auth/logout/route.js

import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Cria um cookie com o mesmo nome, mas com data de expiração no passado
    const serializedCookie = serialize('sessionToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Diz ao navegador para expirar o cookie imediatamente
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: 'Logout bem-sucedido' }), {
      status: 200,
      headers: { 'Set-Cookie': serializedCookie },
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json({ message: 'Erro ao fazer logout' }, { status: 500 });
  }
}