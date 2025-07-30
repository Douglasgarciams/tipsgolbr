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
    // Retorna uma resposta com estrutura padrão para não quebrar o Promise.all
    return { response: [] }; 
  }
  return res.json();
}


// --- NOVA FUNÇÃO PARA ENRIQUECER JOGOS COM SUAS ODDS (ACRESCENTADA) ---
async function enrichFixturesWithOdds(fixtures: any[]) {
    if (!fixtures || fixtures.length === 0) return [];

    // Para cada jogo do histórico, criamos uma "lista de compras" de odds
    const oddsPromises = fixtures.map(game => {
        return Promise.all([
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 1 }),   // Vencedor da Partida
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 25 }),  // Mais/Menos 0.5
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 2 }),   // Mais/Menos 1.5
            fetchRapidAPI('odds', { fixture: game.fixture.id, bet: 5 }),   // Mais/Menos 2.5
        ]);
    });

    // Espera todas as buscas de odds para todos os jogos terminarem
    const oddsResults = await Promise.all(oddsPromises);

    // Agora, juntamos cada jogo com suas respectivas odds
    return fixtures.map((game, index) => {
        const [matchWinner, overUnder05, overUnder15, overUnder25] = oddsResults[index];
        
        // Função auxiliar para extrair os valores de odd de forma segura
        const getOddsValues = (oddsData: any, type: string) => {
            const values = oddsData?.response?.[0]?.bookmakers[0]?.bets[0]?.values;
            if (!values) return {};

            if (type === 'matchWinner') {
                return {
                    home: values.find(o => o.value === 'Home')?.odd,
                    away: values.find(o => o.value === 'Away')?.odd,
                };
            }
            if (type.startsWith('overUnder')) {
                 const line = type.split('_')[1].replace('_', '.');
                 return {
                    over: values.find(o => o.value === `Over ${line}`)?.odd,
                    under: values.find(o => o.value === `Under ${line}`)?.odd,
                 }
            }
            return {};
        }

        // Adiciona a propriedade 'odds' a cada jogo do histórico
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


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('fixtureId');
  const homeTeamId = searchParams.get('homeTeamId');
  const awayTeamId = searchParams.get('awayTeamId');
  const leagueId = searchParams.get('leagueId');
  const season = new Date().getFullYear().toString();

  // --- NOVO RECURSO ---
  // Lendo o novo parâmetro "last" da URL. O padrão será 10 se não for fornecido.
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
        statisticsData, 
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
      fetchRapidAPI('fixtures/statistics', { fixture: fixtureId }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 1 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 2 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 5 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 3 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 8 }),
      fetchRapidAPI('odds', { fixture: fixtureId, bet: 12 }),
      fetchRapidAPI('fixtures', { id: fixtureId }),
      fetchRapidAPI('fixtures/lineups', { fixture: fixtureId }),
    ]);

    // --- ETAPA 2: Buscar as odds para os jogos históricos (ACRESCENTADO) ---
    const enrichedHomeTeamForm = await enrichFixturesWithOdds(homeTeamLastGames?.response || []);
    const enrichedAwayTeamForm = await enrichFixturesWithOdds(awayTeamLastGames?.response || []);
    
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

    // Retorna todos os dados, agora com o histórico de jogos enriquecido
    return NextResponse.json({
      h2h: h2hData?.response || [],
      homeTeamForm: enrichedHomeTeamForm, // <-- DADOS ENRIQUECIDOS COM ODDS
      awayTeamForm: enrichedAwayTeamForm, // <-- DADOS ENRIQUECIDOS COM ODDS
      standings: standingsData?.response?.[0]?.league?.standings[0] || [],
      statistics: statisticsData?.response || [],
      odds: odds,
      fixtureInfo,
      lineup: lineupData?.response || [],
    });

  } catch (error: any) {
    console.error("ERRO CRÍTICO na rota /api/fixture-analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
