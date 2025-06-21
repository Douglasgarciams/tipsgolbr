import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
    const token = request.cookies.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }

    let userId;
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        
        // CORRIGIDO AQUI: De payload.id para payload.userId
        userId = parseInt(payload.userId); 

        // Linhas de depuração (pode remover depois que funcionar)
        console.log('Payload completo do token:', payload); 
        console.log('Valor de userId extraído do token (parseado):', userId);
        console.log('Tipo de userId (parseado):', typeof userId);

    } catch (err) {
        console.error('Erro ao verificar token (detalhes):', err);
        return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    try {
        const { palpiteId, valorApostado, resultadoPNL } = await request.json();

        if (!palpiteId || typeof valorApostado === 'undefined' || typeof resultadoPNL === 'undefined') {
            return NextResponse.json({ message: 'Dados incompletos para registrar a aposta.' }, { status: 400 });
        }

        const apostaExistente = await prisma.apostaFeita.findUnique({
            where: {
                usuarioId_palpiteId: {
                    usuarioId: userId, 
                    palpiteId: palpiteId,
                },
            },
        });

        if (apostaExistente) {
            return NextResponse.json({ message: 'Você já registrou este palpite.' }, { status: 409 }); 
        }

        const newAposta = await prisma.apostaFeita.create({
            data: {
                usuarioId: userId,
                palpiteId: palpiteId,
                valorApostado: valorApostado,
                resultadoPNL: resultadoPNL,
            },
        });

        return NextResponse.json({ message: 'Aposta registrada com sucesso!', aposta: newAposta }, { status: 200 });

    } catch (error) {
        console.error('Erro ao registrar aposta:', error);
        if (error.code === 'P2002' && error.meta?.target?.includes('usuarioId_palpiteId')) {
            return NextResponse.json({ message: 'Você já registrou esta aposta para este palpite.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Erro interno ao registrar a aposta.' }, { status: 500 });
    }
}