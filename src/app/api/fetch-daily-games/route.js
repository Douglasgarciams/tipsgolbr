// src/app/api/fetch-daily-games/route.js
// Endpoint para buscar jogos da Football-Data.org somente de hoje e amanhã, e salvá-los no banco de dados.

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista de IDs de ligas populares na Football-Data.org
// Ajustado para incluir IDs das ligas que você listou.
const POPULAR_LEAGUE_IDS = [
  2021, // PL - Premier League
  2002, // BL1 - Bundesliga
  2019, // SA - Serie A
  2014, // PD - Primera Division (La Liga)
  2015, // FL1 - Ligue 1
  2017, // PPL - Primeira Liga (Portugal)
  2013, // BSA - Campeonato Brasileiro Série A (Adicionado)
  2001, // CL - UEFA Champions League (Adicionado)
  2003, // DED - Eredivisie (Adicionado)
  2016  // ELC - Championship (Adicionado)
];

export async function GET() { // Usamos GET para testar facilmente via navegador.
  try {
    const apiKey = process.env.FOOTBALL_DATA_ORG_KEY;

    if (!apiKey) {
      console.error("FOOTBALL_DATA_ORG_KEY não configurada.");
      return NextResponse.json(
        { message: 'Erro de configuração: Chave da API Football-Data.org não encontrada.' },
        { status: 500 }
      );
    }

    // CORREÇÃO DE FUSO HORÁRIO E PERÍODO:
    // Criar datas de início e fim do período em UTC.
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDay = now.getUTCDate();

    // Início do período: Hoje em UTC
    const startDateUTC = new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0));
    // Fim do período: Início de amanhã em UTC (para incluir jogos de hoje e amanhã)
    const endDateUTC = new Date(Date.UTC(utcYear, utcMonth, utcDay + 1, 0, 0, 0));
    
    console.log(`Buscando jogos entre ${startDateUTC.toISOString().split('T')[0]} e ${endDateUTC.toISOString().split('T')[0]} (somente hoje e amanhã)`);

    const allMatches = [];

    for (const leagueId of POPULAR_LEAGUE_IDS) {
        console.log(`Buscando jogos da Liga ID: ${leagueId}`);
        
        const statusToFetch = 'SCHEDULED'; 
        
        const response = await fetch(`https://api.football-data.org/v4/competitions/${leagueId}/matches?status=${statusToFetch}`, {
            method: 'GET',
            headers: { 'X-Auth-Token': apiKey }
        });

        if (!response.ok) {
            console.error(`Erro ao buscar jogos da Liga ${leagueId} com status ${statusToFetch}: ${response.status} ${response.statusText}`);
            if (response.status === 429) {
                console.error("Limite de requisições excedido para Football-Data.org. Parando busca de ligas devido ao rate limit.");
                return NextResponse.json(
                    { message: 'Limite de requisições da API excedido. Tente novamente em um minuto.' },
                    { status: 429 }
                );
            }
            if (response.status === 500 && response.statusText.includes('ConnectTimeoutError')) { 
                console.error("Erro de conexão/timeout com Football-Data.org. Aumentando o atraso ou verificando a API.");
                return NextResponse.json(
                    { message: 'Erro de conexão com a API externa. Tente novamente mais tarde.' },
                    { status: 500 }
                );
            }
            continue; 
        }

        const data = await response.json();
        console.log(`Liga ${leagueId}, Status ${statusToFetch}: Recebidos ${data.matches ? data.matches.length : 0} jogos.`);
        if (data.matches) {
            allMatches.push(...data.matches);
        }
        await new Promise(resolve => setTimeout(resolve, 8000)); 
    }
    
    console.log(`Total de jogos recebidos da API antes da filtragem de data: ${allMatches.length}`);

    const relevantFixtures = allMatches.filter(match => {
        const matchDate = new Date(match.utcDate); 
        return matchDate >= startDateUTC && matchDate < endDateUTC; 
    });

    console.log(`Total de jogos após a filtragem de data (${startDateUTC.toISOString().split('T')[0]} a ${endDateUTC.toISOString().split('T')[0]}): ${relevantFixtures.length}`);

    if (!relevantFixtures || relevantFixtures.length === 0) {
      console.log(`Nenhum jogo encontrado para o período especificado com base nas ligas populares.`);
      return NextResponse.json({ message: `Nenhum jogo encontrado para o período especificado.` }, { status: 200 });
    }

    console.log(`Encontrados ${relevantFixtures.length} jogos filtrados para o período.`);

    const newPalpites = [];
    for (const fixture of relevantFixtures) {
      const { id: matchId, homeTeam, awayTeam, competition, utcDate } = fixture;

      const jogoNome = `${homeTeam.name} vs. ${awayTeam.name}`;
      const dataHora = new Date(utcDate); 

      const existingPalpite = await prisma.palpite.findFirst({
        where: {
          jogo: jogoNome,
          dataHora: dataHora,
        },
      });

      if (existingPalpite) {
        console.log(`Jogo ${jogoNome} em ${dataHora.toISOString()} já existe. Pulando.`);
        continue;
      }

      // ALTERADO: Palpite e MetodoAposta agora são null, pois não há inteligência para preenchê-los
      const palpite = await prisma.palpite.create({
        data: {
          esporte: 'Futebol', 
          competicao: competition.name || 'Desconhecida',
          jogo: jogoNome,
          dataHora: dataHora,
          palpite: null, // <<<<< ALTERADO AQUI
          link: `https://www.google.com/search?q=${encodeURIComponent(jogoNome)} ${encodeURIComponent(competition.name)}`, 
          oddpesquisada: null, 
          metodoAposta: null, // <<<<< ALTERADO AQUI
          resultado: 'PENDING', 
          placar: null,
        },
      });
      newPalpites.push(palpite);
      console.log(`Palpite para ${jogoNome} salvo com sucesso!`);
    }

    return NextResponse.json(
      { message: `Processamento concluído. ${newPalpites.length} novos palpites adicionados.`, newPalpites },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro geral na API fetch-daily-games:', error);
    return NextResponse.json(
      { message: 'Erro interno ao processar jogos diários.', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
