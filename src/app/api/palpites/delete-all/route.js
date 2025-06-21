// src/app/api/palpites/delete-all/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function DELETE(request) {
    const token = request.cookies.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }

    let payload;
    try {
        payload = (await jwtVerify(token, getJwtSecretKey())).payload;
    } catch (err) {
        return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    // Verifica se o usuário é ADMIN
    if (payload.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' }, { status: 403 });
    }

    try {
        // Deleta todos os registros na tabela Palpite
        // O onDelete: Cascade no schema.prisma deve lidar com as ApostaFeita relacionadas.
        const deleteCount = await prisma.palpite.deleteMany();

        return NextResponse.json({ message: `Foram excluídos ${deleteCount.count} palpites.` }, { status: 200 });
    } catch (error) {
        console.error('Erro ao deletar todos os palpites:', error);
        return NextResponse.json({ message: 'Erro interno ao deletar todos os palpites.' }, { status: 500 });
    }
}