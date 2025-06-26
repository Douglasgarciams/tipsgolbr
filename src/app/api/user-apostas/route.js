import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

const formatMetodoName = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export async function GET(request) {
    const token = request.cookies.get('sessionToken')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }

    let userId;
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        userId = parseInt(payload.userId);

        console.log('API user-apostas: userId extraído do token:', userId); 
        if (isNaN(userId)) {
            console.error('API user-apostas: Erro: userId do token não é um número válido:', payload.userId); 
            return NextResponse.json({ message: 'Token inválido: ID do usuário não encontrado ou inválido.' }, { status: 401 });
        }

    } catch (err) {
        console.error('API user-apostas: Erro ao verificar token:', err); 
        return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    try {
        const apostas = await prisma.apostaFeita.findMany({
            where: { usuarioId: userId },
            // REMOVIDO: A inclusão do 'palpite' e seus campos, pois o metodo está copiado no ApostaFeita
            // include: {
            //     palpite: {
            //         select: {
            //             jogo: true,
            //             palpite: true, // Era o campo string que guardava o nome do método
            //             link: true,
            //             oddpesquisada: true,
            //             metodoAposta: true, // O enum do método
            //         }
            //     }
            // },
            orderBy: { data: 'desc' },
        });

        console.log('API user-apostas: Apostas encontradas para o usuário:', apostas.length); 
        apostas.forEach(aposta => {
            // Agora o log usa aposta.palpiteMetodo
            console.log('API user-apostas: Detalhe da aposta (antes do cálculo):', aposta.id, 'Método Copiado:', aposta.palpiteMetodo, 'Valor Apostado:', aposta.valorApostado, 'PNL:', aposta.resultadoPNL); 
        });

        // --- Calcular Resumo PNL e ROI Geral ---
        let totalLucro = 0;
        let totalPrejuizo = 0;
        let totalApostado = 0; // Geral

        // --- Calcular PNL e ROI por Método ---
        const resultadosPorMetodo = {};

        apostas.forEach(aposta => {
            // AGORA USANDO aposta.palpiteMetodo
            const metodo = aposta.palpiteMetodo || 'OUTROS'; 
            const valorApostado = aposta.valorApostado; 
            const resultadoPNL = aposta.resultadoPNL || 0;

            console.log(`API user-apostas: Processando aposta ID ${aposta.id} (${metodo}). Valor Apostado: ${valorApostado}, PNL: ${resultadoPNL}`); 

            // Cálculos gerais
            totalApostado += valorApostado; 
            if (resultadoPNL >= 0) {
                totalLucro += resultadoPNL;
            } else {
                totalPrejuizo += resultadoPNL;
            }

            // Cálculos por método
            if (!resultadosPorMetodo[metodo]) {
                resultadosPorMetodo[metodo] = {
                    totalLucro: 0,
                    totalPrejuizo: 0,
                    totalApostado: 0, 
                    saldoFinal: 0,
                    roi: 0,
                    count: 0
                };
            }
            console.log(`   -> Antes: ${metodo} totalApostado: ${resultadosPorMetodo[metodo].totalApostado}. Adicionando: ${valorApostado}`); 
            resultadosPorMetodo[metodo].totalApostado += valorApostado; 
            console.log(`   -> Depois: ${metodo} totalApostado: ${resultadosPorMetodo[metodo].totalApostado}`); 

            if (resultadoPNL >= 0) {
                resultadosPorMetodo[metodo].totalLucro += resultadoPNL;
            } else {
                resultadosPorMetodo[metodo].totalPrejuizo += resultadoPNL;
            }
            resultadosPorMetodo[metodo].saldoFinal += resultadoPNL;
            resultadosPorMetodo[metodo].count++;
        });

        // Finaliza cálculos por método (ROI) e formata para exibição
        const metodosFormatados = Object.keys(resultadosPorMetodo).map(metodoKey => {
            const res = resultadosPorMetodo[metodoKey];
            console.log(`API user-apostas: Finalizando cálculo para ${metodoKey}. Total Apostado final: ${res.totalApostado}`); 
            const roi = res.totalApostado > 0 ? (res.saldoFinal / res.totalApostado) * 100 : 0;
            return {
                metodo: formatMetodoName(metodoKey), 
                totalLucro: res.totalLucro,
                totalPrejuizo: res.totalPrejuizo,
                saldoFinal: res.saldoFinal,
                roi: roi,
                count: res.count,
                totalApostado: res.totalApostado 
            };
        }).sort((a, b) => b.saldoFinal - a.saldoFinal); 

        const saldoFinalGeral = totalLucro + totalPrejuizo;
        const roiGeral = totalApostado > 0 ? (saldoFinalGeral / totalApostado) * 100 : 0;

        const resumoPNL = {
            totalLucro,
            totalPrejuizo,
            saldoFinal: saldoFinalGeral,
            roi: roiGeral,
            totalApostado, 
        };

        console.log('API user-apostas: Resumo PNL Geral Final:', resumoPNL); 
        console.log('API user-apostas: Resultados por Método Final:', metodosFormatados); 

        return NextResponse.json({ apostas, resumoPNL, resultadosPorMetodo: metodosFormatados }, { status: 200 });

    } catch (error) {
        console.error('API user-apostas: Erro ao buscar apostas do usuário:', error); 
        return NextResponse.json({ message: 'Erro interno ao buscar suas apostas.' }, { status: 500 });
    }
}
