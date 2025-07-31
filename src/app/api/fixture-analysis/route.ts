// ARQUIVO: src/app/api/fixture-analysis/route.ts

import { NextResponse } from "next/server";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST;

// Função auxiliar para fazer chamadas à API da RapidAPI (sem alterações)
async function fetchRapidAPI(path: string, params: Record<string, any> = {}) {
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
    return { response: [] }; 
  }
  return res.json();
}

// Função para enriquecer jogos com ODDS (sem alterações)
async function enrichFixturesWithOdds(fixtures: any[]) {
    if (!fixtures || fixtures.length === 0) return [];

    const oddsPromises = fixtures.map(game => {
        return Promise.all([
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 1 }),
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 25 }),
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 2 }),
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 5 }),
        ]);
    });

    const oddsResults = await Promise.all(oddsPromises);

    return fixtures.map((game, index) => {
        const [matchWinner, overUnder05, overUnder15, overUnder25] = oddsResults[index];
        
        const getOddsValues = (oddsData: any, type: string) => {
            const values = oddsData?.response?.[0]?.bookmakers[0]?.bets[0]?.values;
            if (!values) return {};

            if (type === 'matchWinner') {
                return {
                    home: values.find((o: any) => o.value === 'Home')?.odd,
                    away: values.find((o: any) => o.value === 'Away')?.odd,
                };
            }
            if (type.startsWith('overUnder')) {
                const line = type.split('_')[1].replace('_', '.');
                return {
                    over: values.find((o: any) => o.value === `Over ${line}`)?.odd,
                    under: values.find((o: any) => o.value === `Under ${line}`)?.odd,
                }
            }
            return {};
        }

        return {
            ...game,
            odds: {
                matchWinner: getOddsValues(matchWinner, 'matchWinner'),
                overUnder_0_5: getOddsValues(overUnder05, 'overUnder_0.5'),
                overUnder_1_5: getOddsValues(overUnder15, 'overUnder_1.5'),
                overUnder_2_5: getOddsValues(overUnder25, 'overUnder_2.5'),
            }
        };
    });
}

// --- NOVO ---
// Função para enriquecer os jogos com suas ESTATÍSTICAS detalhadas.
async function enrichFixturesWithStats(fixtures: any[]) {
    if (!fixtures || fixtures.length === 0) return [];

    // Cria uma promessa para buscar as estatísticas de cada jogo do histórico
    const statsPromises = fixtures.map(game => 
        fetchRapidAPI('fixtures/statistics', { fixture: game.fixture.id })
    );

    // Espera todas as buscas de estatísticas terminarem
    const statsResults = await Promise.all(statsPromises);

    // Agora, junta cada jogo com suas respectivas estatísticas
    return fixtures.map((game, index) => {
        return {
            ...game,
            // A resposta da API de estatísticas já é um array, então o pegamos diretamente
            statistics: statsResults[index]?.response || [] 
        };
    });
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('fixtureId');
  const homeTeamId = searchParams.get('homeTeamId');
  const awayTeamId = searchParams.get('awayTeamId');
  const leagueId = searchParams.get('leagueId');
  const season = new Date().getFullYear().toString();
  const last = searchParams.get('last') || '10';

  if (!fixtureId || !homeTeamId || !awayTeamId || !leagueId) {
    return NextResponse.json({ error: "Parâmetros faltando." }, { status: 400 });
  }

  try {
    // --- ETAPA 1: Buscar os dados principais (sem alteração) ---
    const [
        h2hData, 
        homeTeamLastGames, 
        awayTeamLastGames,
        standingsData,
        // Removido 'statisticsData' daqui, pois será buscado para cada jogo
        matchWinnerOdds,
        oddsOverUnder15,
        overUnder_2_5_Odds,
        oddsOverUnder35,
        bothTeamsScoreOdds,
        doubleChanceOdds,
        fixtureInfoData,
        lineupData
    ] = await Promise.all([
      fetchRapidAPI('fixtures/headtohead', { h2h: `${homeTeamId}-${awayTeamId}`, last: last }),
      fetchRapidAPI('fixtures', { team: homeTeamId, last: 10, season: season }),
      fetchRapidAPI('fixtures', { team: awayTeamId, last: 10, season: season }),
      fetchRapidAPI('standings', { league: leagueId, season: season }),
      // A busca de estatísticas do jogo ATUAL foi movida para baixo para clareza
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 1 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 2 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 5 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 3 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 8 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 12 }),
      fetchRapidAPI('fixtures', { id: fixtureId }),
      fetchRapidAPI('fixtures/lineups', { fixture: fixtureId }),
    ]);

    // --- ETAPA 2: Enriquecer os jogos do histórico com ESTATÍSTICAS e ODDS ---
    // --- ALTERADO ---
    // Agora, buscamos as estatísticas e as odds para cada jogo do histórico em paralelo.

    const homeFixtures = homeTeamLastGames?.response || [];
    const awayFixtures = awayTeamLastGames?.response || [];
    const h2hFixtures = h2hData?.response || [];

    // Executa o enriquecimento de estatísticas e odds em paralelo para todos os jogos
    const [
        enrichedHomeTeamForm,
        enrichedAwayTeamForm,
        enrichedH2H,
        // Também busca as estatísticas do jogo atual aqui
        currentFixtureStats 
    ] = await Promise.all([
        enrichFixturesWithStats(homeFixtures).then(enrichFixturesWithOdds),
        enrichFixturesWithStats(awayFixtures).then(enrichFixturesWithOdds),
        enrichFixturesWithStats(h2hFixtures).then(enrichFixturesWithOdds),
        fetchRapidAPI('fixtures/statistics', { fixture: fixtureId })
    ]);
    
    // Organiza as odds do jogo atual (sem alteração)
    const odds = {
        matchWinner: matchWinnerOdds?.response[0] || null,
        overUnder_1_5: oddsOverUnder15?.response[0] || null,
        overUnder_2_5: overUnder_2_5_Odds?.response[0] || null,
        overUnder_3_5: oddsOverUnder35?.response[0] || null,
        bothTeamsScore: bothTeamsScoreOdds?.response[0] || null,
        doubleChance: doubleChanceOdds?.response[0] || null,
    };
    
    const fixtureInfo = fixtureInfoData?.response?.[0] || null;
    const lineup = lineupData?.response?.[0] || null;

    // --- ETAPA 3: Montar a resposta final ---
    // --- ALTERADO ---
    // Agora enviamos os dados totalmente enriquecidos para o frontend.
    return NextResponse.json({
      h2h: enrichedH2H,
      homeTeamForm: enrichedHomeTeamForm,
      awayTeamForm: enrichedAwayTeamForm,
      standings: standingsData?.response?.[0]?.league?.standings[0] || [],
      // Inclui as estatísticas do jogo ATUAL
      statistics: currentFixtureStats?.response || [], 
      odds: odds,
      fixtureInfo,
      lineup: lineupData?.response || [],
    });

  } catch (error: any) {
    console.error("ERRO CRÍTICO na rota /api/fixture-analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}