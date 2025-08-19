// src/app/api/users/[id]/activate/route.js

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

export async function POST(request, { params }) {
    // --- LÓGICA DE SEGURANÇA ---
    try {
        const token = request.cookies.get('sessionToken')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
        }
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
        }
    } catch (error) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    // --- FIM DA LÓGICA DE SEGURANÇA ---

    try {
        const userId = parseInt(params.id);

        // Calcula a data de expiração para 32 dias a partir de hoje
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 32);

        // Atualiza o usuário no banco de dados
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'ACTIVE',
                subscriptionExpiresAt: expiryDate,
            }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error(`Erro ao ativar assinatura para o usuário ${params.id}:`, error);
        return NextResponse.json({ message: `Erro ao ativar assinatura` }, { status: 500 });
    }
}