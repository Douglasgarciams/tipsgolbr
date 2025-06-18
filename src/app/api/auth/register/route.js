// src/app/api/auth/register/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Validação básica dos dados recebidos
    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // 2. Verificar se o usuário já existe no banco de dados
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 }); // 409 = Conflito
    }

    // 3. Criptografar a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Criar o novo usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword, // Salva a senha criptografada
      },
    });

    // 5. Retornar uma resposta de sucesso (sem enviar a senha de volta)
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 = Criado com Sucesso

  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}