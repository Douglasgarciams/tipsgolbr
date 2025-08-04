// ARQUIVO: src/app/api/fetch-daily/route.ts

import { NextResponse } from "next/server";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST;

// Função original, simples e direta
async function fetchRapidAPI(path: string, params: Record<string, any> = {}) {
  if (!API_KEY || !API_HOST) {
    throw new Error("As variáveis de ambiente da API não foram encontradas.");
  }
  const url = new URL(`https://${API_HOST}/v3/${path}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val as string));
  
  const res = await fetch(url.toString(), {
    headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST },
    next: { revalidate: 600 }, // Cache de 10 minutos
  });

  if (!res.ok) {
    console.error(`Erro na API para ${path}: ${res.status}`);
    return null;
  }
  return res.json();
}

export async function GET() {
  try {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const timezone = "America/Sao_Paulo"; 

    // Busca apenas a primeira página de jogos para hoje e amanhã (rápido e seguro)
    const [todayFixturesRes, tomorrowFixturesRes] = await Promise.all([
      fetchRapidAPI("fixtures", { date: formatDate(today), timezone: timezone }),
      fetchRapidAPI("fixtures", { date: formatDate(tomorrow), timezone: timezone })
    ]);
    
    const allFixtures = [
        ...(todayFixturesRes?.response || []), 
        ...(tomorrowFixturesRes?.response || [])
    ];

    // Lógica para buscar as classificações (sem alteração)
    const uniqueLeagueIds = Array.from(new Set(allFixtures.map(f => f.league.id)));
    const season = new Date().getFullYear();
    const standingsPromises = uniqueLeagueIds.map(leagueId => 
      fetchRapidAPI("standings", { league: leagueId, season: season })
    );
    const standingsResults = await Promise.all(standingsPromises);
    const standingsData = standingsResults.reduce((acc, result) => {
        if (result?.response?.[0]?.league) {
            acc[result.response[0].league.id] = result.response[0].league.standings[0];
        }
        return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ 
        fixtures: allFixtures,
        standings: standingsData,
    });

  } catch (error: any) {
    console.error("ERRO CRÍTICO em /api/fetch-daily:", error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}