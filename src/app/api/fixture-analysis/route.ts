// ARQUIVO: src/app/api/fixture-analysis/route.ts

import { NextResponse } from "next/server";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST;

// Função auxiliar para fazer chamadas à API da RapidAPI
async function fetchRapidAPI(path: string, params: Record<string, any> = {}) {
  if (!API_KEY || !API_HOST) {
    throw new Error("As variáveis de ambiente da API não foram encontradas.");
  }
  const url = new URL(`https://${API_HOST}/v3/${path}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val as string));
  
  const res = await fetch(url.toString(), {
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST },
    next: { revalidate: 300 }, // Cache de 5 minutos para dados de análise
  });

  if (!res.ok) {
    console.error(`Erro na API para ${path} com params ${JSON.stringify(params)}. Status: ${res.status}`);
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
    // Busca todos os dados de análise em paralelo, incluindo as novas estatísticas
    const [
        h2hData, 
        homeTeamLastGames, 
        awayTeamLastGames,
        standingsData,
        statisticsData, 
        matchWinnerOdds,
        overUnder_2_5_Odds,
        bothTeamsScoreOdds,
        doubleChanceOdds,
        fixtureInfoData,
        lineupData
    ] = await Promise.all([
      fetchRapidAPI('fixtures/headtohead', { h2h: `${homeTeamId}-${awayTeamId}`, last: 5 }),
      fetchRapidAPI('fixtures', { team: homeTeamId, last: 5, season: season }),
      fetchRapidAPI('fixtures', { team: awayTeamId, last: 5, season: season }),
      fetchRapidAPI('standings', { league: leagueId, season: season }),
      fetchRapidAPI('fixtures/statistics', { fixture: fixtureId }), // <-- ADICIONADO
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 1 }),  // Vencedor
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 5 }),  // Mais/Menos 2.5
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 8 }),  // Ambas Marcam
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 12 }), // Hipótese Dupla
      fetchRapidAPI('fixtures', { id: fixtureId }), // <-- detalhes do jogo
      fetchRapidAPI('fixtures/lineups', { fixture: fixtureId }), // <-- escalações
    ]);

    // Organiza as odds num único objeto para facilitar o uso no front-end
    const odds = {
        matchWinner: matchWinnerOdds?.response[0] || null,
        overUnder_2_5: overUnder_2_5_Odds?.response[0] || null,
        bothTeamsScore: bothTeamsScoreOdds?.response[0] || null,
        doubleChance: doubleChanceOdds?.response[0] || null,
    };

    const fixtureInfo = fixtureInfoData?.response?.[0] || null;
    const lineup = lineupData?.response?.[0] || null;

    // Retorna todos os dados da análise, incluindo as novas estatísticas
    return NextResponse.json({
      h2h: h2hData?.response || [],
      homeTeamForm: homeTeamLastGames?.response || [],
      awayTeamForm: awayTeamLastGames?.response || [],
      standings: standingsData?.response?.[0]?.league?.standings[0] || [],
      statistics: statisticsData?.response || [], // <-- ADICIONADO
      odds: odds,
      fixtureInfo,
      lineup
    });

  } catch (error: any) {
    console.error("ERRO CRÍTICO na rota /api/fixture-analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
