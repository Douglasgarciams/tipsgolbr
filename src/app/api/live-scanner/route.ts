// ARQUIVO: src/app/api/live-scanner/route.ts

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
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error(`Erro na API para ${path}: ${res.status}`);
    return null;
  }
  return res.json();
}

export async function GET() {
  try {
    const liveFixturesRes = await fetchRapidAPI("fixtures", { live: "all" });
    const liveFixtures = liveFixturesRes?.response || [];

    if (liveFixtures.length === 0) {
      return NextResponse.json({ liveGames: [] });
    }

    // Para cada jogo ao vivo, busca as estatísticas E os eventos
    const gamesWithDetails = await Promise.all(
      liveFixtures.map(async (game: any) => {
        const [statsRes, eventsRes] = await Promise.all([
            fetchRapidAPI("fixtures/statistics", { fixture: game.fixture.id }),
            fetchRapidAPI("fixtures/events", { fixture: game.fixture.id }) // <-- ADICIONADO
        ]);
        
        return {
          ...game,
          statistics: statsRes?.response || [],
          events: eventsRes?.response || [], // <-- ADICIONADO
        };
      })
    );
    
    return NextResponse.json({ liveGames: gamesWithDetails });

  } catch (error: any) {
    console.error("ERRO CRÍTICO na rota /api/live-scanner:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
