// src/app/api/auth/login/route.js --- VERSÃO FINAL E COMPLETA

import prisma from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Procurar o usuário pelo email no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // 2. Se o usuário não for encontrado OU se a senha não bater, retorna erro
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Email ou senha inválidos' }, { status: 401 });
    }

    // 3. Login válido! Prepara os dados para o token com as informações do BANCO
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    };

    // 4. Cria o token
    const token = sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // 5. Salva o token no cookie
    const serializedCookie = serialize('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    // 6. Retorna sucesso e os dados do usuário
    const { password: _, ...userWithoutPassword } = user;
    return new NextResponse(JSON.stringify({ 
        message: 'Login bem-sucedido',
        user: userWithoutPassword 
    }), {
        status: 200,
        headers: { 'Set-Cookie': serializedCookie },
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}