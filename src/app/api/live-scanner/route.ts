// ARQUIVO: src/app/api/live-scanner/route.ts

import { NextResponse } from "next/server";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST;

// --- Nosso Cache no Servidor ---
let cache = {
  data: null as any, // Armazena os dados dos jogos
  lastFetchTime: 0,  // Armazena o tempo da última busca bem-sucedida
};

// Duração do cache em segundos (ex: 60 segundos)
const CACHE_DURATION_SECONDS = 60;

// Função auxiliar para chamadas à API (sem alteração)
async function fetchRapidAPI(path: string, params: Record<string, any> = {}) {
  if (!API_KEY || !API_HOST) {
    throw new Error("As variáveis de ambiente da API não foram encontradas.");
  }
  const url = new URL(`https://${API_HOST}/v3/${path}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val as string));
  
  const res = await fetch(url.toString(), {
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST },
    // O cache do fetch deve ser desabilitado para que nossa lógica de cache funcione
    cache: 'no-store', 
  });

  // Retornamos o objeto 'res' inteiro para podermos checar o status (ex: 429)
  return res; 
}

export async function GET() {
  const now = Date.now();
  const isCacheValid = (now - cache.lastFetchTime) < CACHE_DURATION_SECONDS * 1000;

  // 1. Se o cache for válido, retorna os dados salvos imediatamente
  if (cache.data && isCacheValid) {
    console.log("Servindo dados do cache. Próxima atualização em " + Math.round(CACHE_DURATION_SECONDS - (now - cache.lastFetchTime)/1000) + "s.");
    return NextResponse.json(cache.data);
  }

  // 2. Se o cache estiver expirado, busca novos dados
  console.log("Cache expirado. Buscando novos dados da API externa...");
  try {
    const liveFixturesRes = await fetchRapidAPI("fixtures", { live: "all" });
    
    // Se a chamada principal falhar (incluindo 429), tenta servir o cache antigo
    if (!liveFixturesRes.ok) {
        console.error(`API de Fixtures falhou com status: ${liveFixturesRes.status}.`);
        if (cache.data) {
            console.warn("Servindo dados antigos do cache devido à falha na API.");
            return NextResponse.json(cache.data);
        }
        // Se não houver nem cache, lança o erro
        throw new Error(`API de Fixtures falhou com status: ${liveFixturesRes.status}`);
    }

    const liveFixturesData = await liveFixturesRes.json();
    const liveFixtures = liveFixturesData?.response || [];

    if (liveFixtures.length === 0) {
      // Se não há jogos, limpa o cache e retorna uma lista vazia
      cache.data = { liveGames: [] };
      cache.lastFetchTime = now;
      return NextResponse.json({ liveGames: [] });
    }

    // O loop continua, mas agora só roda a cada 60 segundos para todos os usuários
    const gamesWithDetails = await Promise.all(
      liveFixtures.map(async (game: any) => {
        const [statsRes, eventsRes] = await Promise.all([
          fetchRapidAPI("fixtures/statistics", { fixture: game.fixture.id }),
          fetchRapidAPI("fixtures/events", { fixture: game.fixture.id })
        ]);

        // Processa os dados mesmo que uma das chamadas internas falhe
        const statsData = statsRes.ok ? await statsRes.json() : { response: [] };
        const eventsData = eventsRes.ok ? await eventsRes.json() : { response: [] };
        
        return {
          ...game,
          statistics: statsData?.response || [],
          events: eventsData?.response || [],
        };
      })
    );
    
    // 3. Guarda os novos dados e o tempo no cache
    const newData = { liveGames: gamesWithDetails };
    cache.data = newData;
    cache.lastFetchTime = now;
    console.log(`Cache atualizado com ${gamesWithDetails.length} jogos.`);
    
    return NextResponse.json(newData);

  } catch (error: any) {
    console.error("ERRO CRÍTICO na rota /api/live-scanner:", error.message);
    // Em caso de erro, SEMPRE tenta retornar o cache antigo para não quebrar o frontend
    if (cache.data) {
        console.warn("Servindo dados antigos do cache devido a um erro crítico.");
        return NextResponse.json(cache.data);
    }
    // Se não houver cache, retorna o erro 500
    return NextResponse.json({ error: "Falha ao buscar dados dos jogos." }, { status: 500 });
  }
}