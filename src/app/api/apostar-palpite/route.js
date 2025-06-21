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
        userId = parseInt(payload.userId);

        if (isNaN(userId)) {
            console.error('API apostar-palpite: Erro: userId do token não é um número válido:', payload.userId);
            return NextResponse.json({ message: 'Token inválido: ID do usuário não encontrado ou inválido.' }, { status: 401 });
        }

    } catch (err) {
        console.error('API apostar-palpite: Erro ao verificar token:', err);
        return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    try {
        const { palpiteId, valorApostado, resultadoPNL } = await request.json();

        if (!palpiteId || typeof valorApostado === 'undefined' || typeof resultadoPNL === 'undefined') {
            return NextResponse.json({ message: 'Dados incompletos para registrar a aposta.' }, { status: 400 });
        }

        // NOVO: Buscar os detalhes do Palpite original
        const palpiteOriginal = await prisma.palpite.findUnique({
            where: { id: palpiteId },
            select: {
                jogo: true,
                palpite: true, // É o campo string que guarda o nome do método (ex: LAY_0X3)
                competicao: true,
                oddpesquisada: true, // Certifique-se de que é oddpesquisada
                link: true,
                metodoAposta: true, // O enum do método (ex: LAY_0X3)
            }
        });

        if (!palpiteOriginal) {
            return NextResponse.json({ message: 'Palpite original não encontrado.' }, { status: 404 });
        }

        // Verifica se o usuário já registrou uma aposta para este palpite
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
                // NOVO: Preenchendo os campos duplicados com os detalhes do Palpite original
                palpiteJogo: palpiteOriginal.jogo,
                palpiteMetodo: palpiteOriginal.palpite, // Usando o campo 'palpite' string para guardar o nome do método
                palpiteCompeticao: palpiteOriginal.competicao,
                palpiteOdds: palpiteOriginal.oddpesquisada, // Usando oddpesquisada
                palpiteLink: palpiteOriginal.link,
            },
        });

        return NextResponse.json({ message: 'Aposta registrada com sucesso!', aposta: newAposta }, { status: 200 });

    } catch (error) {
        console.error('API apostar-palpite: Erro ao registrar aposta:', error);
        if (error.code === 'P2002' && error.meta?.target?.includes('usuarioId_palpiteId')) {
            return NextResponse.json({ message: 'Você já registrou esta aposta para este palpite.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Erro interno ao registrar a aposta.' }, { status: 500 });
    }
}