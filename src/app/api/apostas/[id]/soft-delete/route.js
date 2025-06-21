// src/app/api/apostas/[id]/soft-delete/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function PUT(request, { params }) {
    const token = request.cookies.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }

    let userIdFromToken;
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        userIdFromToken = parseInt(payload.userId);
        if (isNaN(userIdFromToken)) {
            return NextResponse.json({ message: 'Token inválido: ID do usuário não encontrado.' }, { status: 401 });
        }
    } catch (err) {
        return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    try {
        const { id: apostaIdString } = params;
        const apostaId = parseInt(apostaIdString);

        if (isNaN(apostaId)) {
            return NextResponse.json({ message: 'ID da aposta inválido.' }, { status: 400 });
        }

        // Garante que o usuário só pode deletar suas próprias apostas
        const aposta = await prisma.apostaFeita.findUnique({
            where: { id: apostaId },
            select: { usuarioId: true } // Seleciona apenas o ID do usuário para verificação
        });

        if (!aposta) {
            return NextResponse.json({ message: 'Aposta não encontrada.' }, { status: 404 });
        }

        if (aposta.usuarioId !== userIdFromToken) {
            return NextResponse.json({ message: 'Acesso negado. Você não tem permissão para deletar esta aposta.' }, { status: 403 });
        }

        // Realiza a soft delete
        const updatedAposta = await prisma.apostaFeita.update({
            where: { id: apostaId },
            data: { isDeleted: true },
        });

        return NextResponse.json({ message: 'Aposta ocultada com sucesso!', aposta: updatedAposta }, { status: 200 });

    } catch (error) {
        console.error('Erro ao ocultar aposta:', error);
        return NextResponse.json({ message: 'Erro interno ao ocultar a aposta.' }, { status: 500 });
    }
}