// ARQUIVO: src/app/api/fixture-analysis/route.ts

import { NextResponse } from "next/server";
import { unstable_cache } from 'next/cache';

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST;

// Função fetchRapidAPI (sem alterações)
async function fetchRapidAPI(path: string, params: Record<string, any> = {}) {
  // ...código inalterado...
  if (!API_KEY || !API_HOST) {
    throw new Error("As variáveis de ambiente da API não foram encontradas.");
  }
  const url = new URL(`https://${API_HOST}/v3/${path}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val as string));
  
  const res = await fetch(url.toString(), {
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error(`Erro na API para ${path} com params ${JSON.stringify(params)}. Status: ${res.status}`);
    return null;
  }
  return res.json();
}

// Função de delay (sem alterações)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Função enrichFixturesWithStats (sem alterações)
async function enrichFixturesWithStats(fixturesResponse: any) {
  // ...código inalterado...
  if (!fixturesResponse || !fixturesResponse.response || fixturesResponse.response.length === 0) {
    return [];
  }

  const fixtures = fixturesResponse.response;
  const enrichedFixtures = [];
  const chunkSize = 5;

  for (let i = 0; i < fixtures.length; i += chunkSize) {
    const chunk = fixtures.slice(i, i + chunkSize);
    console.log(`[Rate Limiter] Processando lote de estatísticas: ${i + 1} a ${i + chunk.length} de ${fixtures.length}`);

    const statsPromises = chunk.map((fixture: any) =>
      fetchRapidAPI('fixtures/statistics', { fixture: fixture.fixture.id })
    );
    
    const statsResults = await Promise.all(statsPromises);

    const enrichedChunk = chunk.map((fixture: any, index: number) => {
      const statsData = statsResults[index];
      return { ...fixture, statistics: statsData?.response || [] };
    });
    enrichedFixtures.push(...enrichedChunk);

    if (i + chunkSize < fixtures.length) {
      console.log(`[Rate Limiter] Pausando por 1 segundo antes do próximo lote...`);
      await delay(1000);
    }
  }

  return enrichedFixtures;
}


async function getAndProcessFixtureAnalysis(fixtureId: string, homeTeamId: string, awayTeamId: string, leagueId: string) {
    console.log(`[Cache] CACHE MISS: Processando dados para a partida ${fixtureId}...`);
    const season = new Date().getFullYear().toString();

    const [
        h2hData, 
        homeTeamLastGames, 
        awayTeamLastGames,
        statisticsData,
        matchWinnerOdds,
        overUnderOdds, // NOVO: Variável para guardar os dados de Over/Under
        lineupData
    ] = await Promise.all([
        fetchRapidAPI('fixtures/headtohead', { h2h: `${homeTeamId}-${awayTeamId}`, last: 10 }),
        fetchRapidAPI('fixtures', { team: homeTeamId, last: 10, season: season }),
        fetchRapidAPI('fixtures', { team: awayTeamId, last: 10, season: season }),
        fetchRapidAPI('fixtures/statistics', { fixture: fixtureId }),
        fetchRapidAPI('odds', { fixture: fixtureId, bookmaker: '8', bet: '1' }), // Vencedor da Partida
        fetchRapidAPI('odds', { fixture: fixtureId, bookmaker: '8', bet: '5' }), // NOVO: Busca para Gols Acima/Abaixo 2.5
        fetchRapidAPI('fixtures/lineups', { fixture: fixtureId }),
    ]);

    const [enrichedHomeTeamForm, enrichedAwayTeamForm] = await Promise.all([
        enrichFixturesWithStats(homeTeamLastGames),
        enrichFixturesWithStats(awayTeamLastGames)
    ]);

    // ALTERADO: Monta o objeto de odds com ambas as propriedades
    return {
      parameters: { homeTeamId, awayTeamId },
      h2h: h2hData?.response || [],
      homeTeamForm: enrichedHomeTeamForm,
      awayTeamForm: enrichedAwayTeamForm,
      statistics: statisticsData?.response || [], 
      odds: {
          matchWinner: matchWinnerOdds?.response[0] || null,
          overUnder_2_5: overUnderOdds?.response[0] || null, // NOVO: Adiciona os dados ao objeto
      },
      lineup: lineupData?.response || [],
    };
}

// getCachedFixtureAnalysis (sem alterações)
const getCachedFixtureAnalysis = unstable_cache(
    // ...código inalterado...
    async (fixtureId: string, homeTeamId: string, awayTeamId: string, leagueId: string) => 
        getAndProcessFixtureAnalysis(fixtureId, homeTeamId, awayTeamId, leagueId),
    ['fixture-analysis'],
    {
        tags: ['fixtures'],
        revalidate: 3600 
    }
);

// GET handler (sem alterações)
export async function GET(request: Request) {
  // ...código inalterado...
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('fixtureId');
  const homeTeamId = searchParams.get('homeTeamId');
  const awayTeamId = searchParams.get('awayTeamId');
  const leagueId = searchParams.get('leagueId');

  if (!fixtureId || !homeTeamId || !awayTeamId || !leagueId) {
    return NextResponse.json({ error: "Parâmetros faltando." }, { status: 400 });
  }

  try {
    const data = await getCachedFixtureAnalysis(fixtureId, homeTeamId, awayTeamId, leagueId);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("ERRO CRÍTICO na rota /api/fixture-analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}