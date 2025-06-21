import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request) {
    const token = request.cookies.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }

    let userId;
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        userId = parseInt(payload.userId); // Extrai userId do payload do token

        // Verifica se userId é um número válido após parseInt
        if (isNaN(userId)) {
            console.error('Erro: userId do token não é um número válido:', payload.userId);
            return NextResponse.json({ message: 'Token inválido: ID do usuário não encontrado ou inválido.' }, { status: 401 });
        }

    } catch (err) {
        console.error('Erro ao verificar token na API de user-apostas:', err);
        return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    try {
        const apostas = await prisma.apostaFeita.findMany({
            where: { usuarioId: userId },
            include: { // Inclui os dados do Palpite para exibir detalhes
                palpite: {
                    select: {
                        jogo: true,
                        palpite: true,
                        link: true,
                        oddpesquisada: true,
                    }
                }
            },
            orderBy: { data: 'desc' },
        });

        // --- Calcular Resumo PNL e ROI ---
        let totalLucro = 0;
        let totalPrejuizo = 0;
        let totalApostado = 0;

        apostas.forEach(aposta => {
            totalApostado += aposta.valorApostado;
            if (aposta.resultadoPNL >= 0) {
                totalLucro += aposta.resultadoPNL;
            } else {
                totalPrejuizo += aposta.resultadoPNL; // Já é negativo, então soma direto
            }
        });

        const saldoFinal = totalLucro + totalPrejuizo; // Prejuízo já é negativo
        const roi = totalApostado > 0 ? (saldoFinal / totalApostado) * 100 : 0;

        const resumoPNL = {
            totalLucro,
            totalPrejuizo, // Será um valor negativo ou 0
            saldoFinal,
            roi,
        };

        return NextResponse.json({ apostas, resumoPNL }, { status: 200 });

    } catch (error) {
        console.error('Erro ao buscar apostas do usuário:', error);
        return NextResponse.json({ message: 'Erro interno ao buscar suas apostas.' }, { status: 500 });
    }
}