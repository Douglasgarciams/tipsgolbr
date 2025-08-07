// ARQUIVO: src/app/api/fixture-analysis/route.ts

import { NextResponse } from "next/server";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST;

async function fetchRapidAPI(path: string, params: Record<string, any> = {}) {
  if (!API_KEY || !API_HOST) {
    throw new Error("As variáveis de ambiente da API não foram encontradas.");
  }
  const url = new URL(`https://${API_HOST}/v3/${path}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val as string));
  
  const res = await fetch(url.toString(), {
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST },
    next: { revalidate: 300 }, // Cache de 5 minutos
  });

  if (!res.ok) {
    console.error(`Erro na API para ${path} com params ${JSON.stringify(params)}. Status: ${res.status}`);
    // Retornar null em caso de erro para não quebrar o Promise.all
    return null;
  }
  return res.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('fixtureId');
  const homeTeamId = searchParams.get('homeTeamId');
  const awayTeamId = searchParams.get('awayTeamId');
  const leagueId = searchParams.get('leagueId');
  const season = new Date().getFullYear().toString();

  if (!fixtureId || !homeTeamId || !awayTeamId || !leagueId) {
    return NextResponse.json({ error: "Parâmetros faltando." }, { status: 400 });
  }

  try {
    // A lista de chamadas agora é muito menor e mais focada
    const [
        h2hData, 
        homeTeamLastGames, 
        awayTeamLastGames,
        statisticsData,
        matchWinnerOdds,
        lineupData
    ] = await Promise.all([
      fetchRapidAPI('fixtures/headtohead', { h2h: `${homeTeamId}-${awayTeamId}`, last: 10 }),
      fetchRapidAPI('fixtures', { team: homeTeamId, last: 10, season: season }),
      fetchRapidAPI('fixtures', { team: awayTeamId, last: 10, season: season }),
      fetchRapidAPI('fixtures/statistics', { fixture: fixtureId }),
      fetchRapidAPI('odds', { fixture: fixtureId, bookmaker: '8', bet: '1' }),
      fetchRapidAPI('fixtures/lineups', { fixture: fixtureId }),
    ]);

    // Monta o objeto de resposta com os dados essenciais
    return NextResponse.json({
      // Adiciona os parâmetros recebidos à resposta para uso no frontend
      parameters: { homeTeamId, awayTeamId },
      h2h: h2hData?.response || [],
      homeTeamForm: homeTeamLastGames?.response || [],
      awayTeamForm: awayTeamLastGames?.response || [],
      statistics: statisticsData?.response || [], 
      odds: {
          matchWinner: matchWinnerOdds?.response[0] || null,
      },
      lineup: lineupData?.response || [],
    });

  } catch (error: any) {
    console.error("ERRO CRÍTICO na rota /api/fixture-analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}