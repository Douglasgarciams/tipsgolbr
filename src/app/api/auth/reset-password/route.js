// src/app/api/auth/reset-password/route.js - COMPLETO E CORRETO

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
// getJwtSecretKey não é estritamente necessário aqui se o token for gerado por crypto
// Mas, se fosse um JWT que você verifica aqui, precisaria. Por segurança, mantive como estava.
const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET); 

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }

    // 1. Encontrar o token de reset no banco de dados
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: token },
      include: { user: true } // Inclui os dados do usuário associado
    });

    // 2. Verificar a validade do token
    if (!resetTokenRecord) {
      console.error('Reset Password API: Token inválido ou não encontrado.');
      return NextResponse.json({ message: 'Token inválido ou não encontrado.' }, { status: 400 });
    }
    if (resetTokenRecord.expiresAt < new Date()) {
      console.error('Reset Password API: Token expirado.');
      return NextResponse.json({ message: 'Token expirado. Solicite um novo link.' }, { status: 400 });
    }
    if (resetTokenRecord.usedAt) { // Verifica se já foi usado
      console.error('Reset Password API: Token já utilizado.');
      return NextResponse.json({ message: 'Token já utilizado.' }, { status: 400 });
    }

    // 3. Gerar o hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Atualizar a senha do usuário e marcar o token como usado
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() }, // Marca o token como usado
      }),
    ]);

    return NextResponse.json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' }, { status: 200 });

  } catch (error) {
    console.error("Reset Password API: Erro ao redefinir senha:", error);
    return NextResponse.json({ message: 'Erro interno ao redefinir a senha.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}