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
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error(`Erro na API para ${path}: ${res.status}`, errorBody);
        return null;
    }
    return res.json();
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fixtureId = searchParams.get('fixtureId');
    const season = new Date().getFullYear().toString();

    if (!fixtureId) {
        return NextResponse.json({ error: "O ID da partida (fixtureId) é obrigatório." }, { status: 400 });
    }

    try {
        // 1. Primeiro, buscamos os detalhes da partida para obter os IDs dos times
        const fixtureData = await fetchRapidAPI('fixtures', { id: fixtureId });
        const fixture = fixtureData?.response[0];

        if (!fixture) {
            return NextResponse.json({ error: "Partida não encontrada." }, { status: 404 });
        }

        const homeId = fixture.teams.home.id;
        const awayId = fixture.teams.away.id;

        // 2. Agora, buscamos as estatísticas e as odds em paralelo
        const [
            homeTeamLastGames, 
            awayTeamLastGames,
            h2hData,
            oddsData // Nova chamada para buscar as odds
        ] = await Promise.all([
            fetchRapidAPI('fixtures', { team: homeId, last: 20, season: season }),
            fetchRapidAPI('fixtures', { team: awayId, last: 20, season: season }),
            fetchRapidAPI('fixtures/headtohead', { h2h: `${homeId}-${awayId}`, last: 10 }),
            fetchRapidAPI('odds', { fixture: fixtureId, bookmaker: '8' }) // Usando Bet365 (ID 8) como exemplo
        ]);

        return NextResponse.json({
            teams: { // Retornamos os dados dos times que vieram da própria partida
                home: fixture.teams.home,
                away: fixture.teams.away
            },
            homeTeamForm: homeTeamLastGames?.response || [],
            awayTeamForm: awayTeamLastGames?.response || [],
            h2h: h2hData?.response || [],
            odds: oddsData?.response[0] || null, // Adicionamos as odds à resposta
        });

    } catch (error: any) {
        console.error("ERRO na rota /api/team-comparison:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}