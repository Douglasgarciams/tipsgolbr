// src/app/api/users/[id]/deactivate/route.js

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
    // Lógica de segurança para garantir que apenas um ADMIN pode desativar contas
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

    try {
        const userId = parseInt(params.id);

        // Atualiza o usuário no banco, setando o status para INACTIVE
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'INACTIVE',
            }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);

    } catch (error) {
        console.error(`Erro ao desativar assinatura para o usuário ${params.id}:`, error);
        return NextResponse.json({ message: `Erro ao desativar assinatura` }, { status: 500 });
    }
}