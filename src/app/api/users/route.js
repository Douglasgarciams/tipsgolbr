// src/app/api/users/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Variável de ambiente JWT_SECRET não encontrada!');
  }
  return new TextEncoder().encode(secret);
};

export async function GET(request) {
  // --- LÓGICA DE SEGURANÇA ---
  // Apenas Admins podem ver a lista de todos os usuários.
  try {
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Não autorizado: Token não encontrado' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado: Requer privilégios de Administrador' }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Não autorizado: Token inválido' }, { status: 401 });
  }
  // --- FIM DA LÓGICA DE SEGURANÇA ---


  // Se passou pela segurança, busca os usuários no banco de dados
  try {
    const users = await prisma.user.findMany({
      // Seleciona apenas os campos seguros para não expor a senha
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        criadoEm: true
      },
      orderBy: {
        criadoEm: 'desc'
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: 500 });
  }
}