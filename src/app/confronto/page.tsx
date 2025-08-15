'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle, CheckCircle2 } from 'lucide-react';

const calculateDetailedStats = (teamForm: any[], teamId: number) => {
    if (!teamForm || teamForm.length === 0) return {};
    const numGames = teamForm.length;
    let stats = { htGoalScored: 0, ftGoalScored: 0, htGoalConceded: 0, ftGoalConceded: 0, over0_5: 0, over1_5: 0, over2_5: 0, over3_5: 0, under1_5: 0, under2_5: 0, lostAfterLeading: 0, scoredBothHalves: 0, winToNil: 0, blowoutsApplied: 0, blowoutsConceded: 0, scoredFirst: 0, concededFirst: 0, btts: 0, failedToScore: 0, cleanSheets: 0, scoredInST: 0, winsAtHome: 0, totalHomeGames: 0, winsAway: 0, totalAwayGames: 0 };
    teamForm.forEach(game => {
        const isThisTeamHome = game.teams.home.id === teamId;
        const scored = isThisTeamHome ? game.goals.home : game.goals.away;
        const conceded = isThisTeamHome ? game.goals.away : game.goals.home;
        const htScored = isThisTeamHome ? game.score.halftime.home : game.score.halftime.away;
        const htConceded = isThisTeamHome ? game.score.halftime.away : game.score.halftime.home;
        const stScored = scored - (htScored || 0);
        const totalGoals = game.goals.home + game.goals.away;

        if (scored > 0) stats.ftGoalScored++;
        if (conceded > 0) stats.ftGoalConceded++;
        if (htScored > 0) stats.htGoalScored++;
        if (htConceded > 0) stats.htGoalConceded++;

        if (totalGoals > 0.5) stats.over0_5++;
        if (totalGoals < 1.5) stats.under1_5++;
        if (totalGoals < 2.5) stats.under2_5++;
        if (htScored > htConceded && scored < conceded) stats.lostAfterLeading++;
        if (htScored > 0 && stScored > 0) stats.scoredBothHalves++;
        if (scored > conceded && conceded === 0) stats.winToNil++;
        if (totalGoals > 1.5) stats.over1_5++;
        if (totalGoals > 2.5) stats.over2_5++;
        if (totalGoals > 3.5) stats.over3_5++;
        if (totalGoals >= 4) { if (scored > conceded) stats.blowoutsApplied++; else if (conceded > scored) stats.blowoutsConceded++; }
        if (htScored !== null && htConceded !== null) { if (htScored > htConceded) { stats.scoredFirst++; } else if (htConceded > htScored) { stats.concededFirst++; } }
        if (scored > 0 && conceded > 0) stats.btts++;
        if (scored === 0) stats.failedToScore++;
        if (conceded === 0) stats.cleanSheets++;
        if (stScored > 0) stats.scoredInST++;
        if (isThisTeamHome) { stats.totalHomeGames++; if (scored > conceded) stats.winsAtHome++; } else { stats.totalAwayGames++; if (scored > conceded) stats.winsAway++; }
    });
    const toPercent = (value: number, total = numGames) => {
        if (total === 0) return '0';
        return ((value / total) * 100).toFixed(0);
    };
    return {
        'Marcou Gol no HT (%)': toPercent(stats.htGoalScored),
        'Marcou Gol no FT (%)': toPercent(stats.ftGoalScored),
        'Sofreu Gol no HT (%)': toPercent(stats.htGoalConceded),
        'Sofreu Gol no FT (%)': toPercent(stats.ftGoalConceded),
        'Jogos com gol no HT (%)': toPercent(stats.htGoalScored), 'Jogos Over 0.5 FT (%)': toPercent(stats.over0_5), 'Jogos Over 1.5 FT (%)': toPercent(stats.over1_5), 'Jogos Over 2.5 FT (%)': toPercent(stats.over2_5), 'Jogos Over 3.5 FT (%)': toPercent(stats.over3_5), 'Jogos Under 1.5 FT (%)': toPercent(stats.under1_5), 'Jogos Under 2.5 FT (%)': toPercent(stats.under2_5), 'Ambas Marcam (%)': toPercent(stats.btts), 'Marcou em Ambos os Tempos (%)': toPercent(stats.scoredBothHalves), 'Vitórias sem sofrer gols (%)': toPercent(stats.winToNil), 'Goleadas Aplicadas (Venceu com 4+ gols)': toPercent(stats.blowoutsApplied), 'Goleadas Sofridas (Perdeu com 4+ gols)': toPercent(stats.blowoutsConceded), 'Jogos que tomou virada (%)': toPercent(stats.lostAfterLeading), 'Marcou o 1º gol (no HT)': toPercent(stats.scoredFirst), 'Sofreu o 1º gol (no HT)': toPercent(stats.concededFirst), 'Jogos Sem Marcar Gol (%)': toPercent(stats.failedToScore), 'Jogos Sem Sofrer Gol (%)': toPercent(stats.cleanSheets), 'Jogos com Gol no 2ºT (%)': toPercent(stats.scoredInST), 'Vitórias em Casa (%)': toPercent(stats.winsAtHome, stats.totalHomeGames), 'Vitórias Fora (%)': toPercent(stats.winsAway, stats.totalAwayGames),
    };
};

const ComparisonHeader = ({ teams }: { teams: any }) => (
    <div className="grid grid-cols-3 items-center p-4 bg-gray-900 text-white rounded-t-2xl shadow-lg">
        <div className="flex items-center justify-center gap-3">
            <img src={teams.home.logo} alt={teams.home.name} className="h-12 w-12" />
            <h2 className="text-xl font-bold tracking-tight">{teams.home.name}</h2>
        </div>
        <div className="text-center">
            <span className="text-3xl font-light text-gray-500">VS</span>
        </div>
        <div className="flex items-center justify-center gap-3">
            <img src={teams.away.logo} alt={teams.away.name} className="h-12 w-12" />
            <h2 className="text-xl font-bold tracking-tight">{teams.away.name}</h2>
        </div>
    </div>
);

const OddsDisplay = ({ oddsData }: { oddsData: any }) => {
    const matchWinnerBet = oddsData?.bookmakers[0]?.bets.find((bet: any) => bet.name === 'Match Winner');
    if (!matchWinnerBet) {
        return <div className="text-center text-sm text-gray-500 py-4">Odds não disponíveis para este jogo.</div>;
    }
    const values = matchWinnerBet.values;
    const homeOdd = values.find((v: any) => v.value === 'Home')?.odd || '-';
    const drawOdd = values.find((v: any) => v.value === 'Draw')?.odd || '-';
    const awayOdd = values.find((v: any) => v.value === 'Away')?.odd || '-';
    return (
        <div className="px-4 md:px-6 py-3 bg-gray-800 text-white">
            <div className="grid grid-cols-3 text-center divide-x divide-gray-700">
                <div>
                    <p className="text-xs text-gray-400">CASA</p>
                    <p className="text-xl font-bold">{homeOdd}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">EMPATE</p>
                    <p className="text-xl font-bold">{drawOdd}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">FORA</p>
                    <p className="text-xl font-bold">{awayOdd}</p>
                </div>
            </div>
        </div>
    );
};

const ComparisonStatRow = ({ label, homeValue, awayValue, homeColor, awayColor }: { label: string, homeValue: string | number, awayValue: string | number, homeColor: string, awayColor: string }) => {
    const numHome = Number(homeValue);
    const numAway = Number(awayValue);
    const total = numHome + numAway;
    const homeWidth = total > 0 ? (numHome / total) * 100 : 50;
    const awayWidth = total > 0 ? (numAway / total) * 100 : 50;
    return (
        <div className="py-2.5">
            <p className="text-center text-base font-semibold text-gray-600 mb-1.5">{label}</p>
            <div className="w-full h-7 bg-gray-200 rounded-md flex text-white text-xs font-bold shadow-inner overflow-hidden">
                <div className={`flex items-center justify-start pl-3 h-full transition-all duration-500 ${homeColor}`} style={{ width: `${homeWidth}%` }} title={`${homeValue}%`}>
                    {homeWidth > 15 && <span>{homeValue}%</span>}
                </div>
                <div className={`flex items-center justify-end pr-3 h-full transition-all duration-500 ${awayColor}`} style={{ width: `${awayWidth}%` }} title={`${awayValue}%`}>
                    {awayWidth > 15 && <span>{awayValue}%</span>}
                </div>
            </div>
        </div>
    );
};

export default function ConfrontoPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-slate-50"><LoaderCircle className="animate-spin text-blue-600" size={48} /></div>}>
            <ConfrontoView />
        </Suspense>
    );
}

function ConfrontoView() {
    const searchParams = useSearchParams();
    const [comparisonData, setComparisonData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fixtureId = searchParams.get('fixtureId');

    useEffect(() => {
        if (!fixtureId) {
            setError("ID da partida não fornecido na URL.");
            setIsLoading(false); return;
        }
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/team-comparison?fixtureId=${fixtureId}`);
                if (!response.ok) throw new Error('Falha ao buscar dados da comparação.');
                const data = await response.json();
                setComparisonData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [fixtureId]);

    const { homeStats, awayStats } = useMemo(() => {
        if (!comparisonData) return { homeStats: null, awayStats: null };
        return {
            homeStats: calculateDetailedStats(comparisonData.homeTeamForm, comparisonData.teams.home.id),
            awayStats: calculateDetailedStats(comparisonData.awayTeamForm, comparisonData.teams.away.id)
        };
    }, [comparisonData]);

    const { h2hHomeStats, h2hAwayStats } = useMemo(() => {
        if (!comparisonData || !comparisonData.h2h || comparisonData.h2h.length === 0) {
            return { h2hHomeStats: null, h2hAwayStats: null };
        }
        return {
            h2hHomeStats: calculateDetailedStats(comparisonData.h2h, comparisonData.teams.home.id),
            h2hAwayStats: calculateDetailedStats(comparisonData.h2h, comparisonData.teams.away.id)
        };
    }, [comparisonData]);

    // MUDANÇA: Lista de todos os métodos agora inclui as 4 novas estratégias
    const todosOsMetodos = [
        {
            nome: "ENTRADA LAY 0X1",
            fraseFinal: "Observe o jogo em LIVE.",
            condicoes: [
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Marcou Gol no HT (%)', operador: '>=', valor: 60 },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Marcou Gol no FT (%)', operador: '>=', valor: 80 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Sofreu Gol no HT (%)', operador: '>=', valor: 30 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Sofreu Gol no FT (%)', operador: '>=', valor: 60 },
                { tipoDeAnalise: 'odds', time: 'casa', metrica: 'Odd', operador: '>=', valor: 1.70 },
                { tipoDeAnalise: 'odds', time: 'casa', metrica: 'Odd', operador: '<=', valor: 2.30 },
            ]
        },
        {
            nome: "Lay 0x3 - PRÉ-LIVE",
            fraseFinal: "Entrada de segurança com base em favoritismo e tendência de gols.",
            condicoes: [
                { tipoDeAnalise: 'comparacao_odds', comparacao: 'casa_menor_igual_visitante', texto: 'Odd Casa <= Odd Visitante'},
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Marcou Gol no FT (%)', operador: '>=', valor: 80 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Sofreu Gol no FT (%)', operador: '>=', valor: 50 },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Jogos Over 1.5 FT (%)', operador: '>=', valor: 60 },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Vitórias em Casa (%)', operador: '>=', valor: 60 },
            ]
        },
        {
            nome: "Lay 2x2 - LIVE",
            fraseFinal: "Observar em LIVE. Risco elevado, para superfavoritos.",
            condicoes: [
                { tipoDeAnalise: 'odds', time: 'casa', metrica: 'Odd', operador: '<=', valor: 1.40 },
                { tipoDeAnalise: 'odds', time: 'visitante', metrica: 'Odd', operador: '>=', valor: 7 },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Jogos Over 2.5 FT (%)', operador: '>=', valor: 30 },
                { tipoDeAnalise: 'h2h', time: 'casa', metrica: 'Jogos Sem Sofrer Gol (%)', operador: '>=', valor: 30 },
            ]
        },
        {
            nome: "Back Casa - LIVE",
            fraseFinal: "Potencial para o time da casa pressionar e marcar.",
            condicoes: [
                { tipoDeAnalise: 'comparacao_odds', comparacao: 'casa_menor_igual_visitante', texto: 'Odd Casa <= Odd Visitante' },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Marcou Gol no HT (%)', operador: '>=', valor: 50 },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Marcou Gol no FT (%)', operador: '>=', valor: 80 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Marcou Gol no FT (%)', operador: '<=', valor: 80 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Sofreu Gol no HT (%)', operador: '>=', valor: 50 },
                { tipoDeAnalise: 'h2h', time: 'casa', metrica: 'Vitórias em Casa (%)', operador: '>=', valor: 60 },
            ]
        },
        {
            nome: "Back Casa - PRÉ-LIVE",
            fraseFinal: "Análise pré-live indica favoritismo para o time da casa.",
            condicoes: [
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Marcou Gol no HT (%)', operador: '>=', valor: 60 },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Marcou Gol no FT (%)', operador: '>=', valor: 60 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Marcou Gol no FT (%)', operador: '<=', valor: 60 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Sofreu Gol no HT (%)', operador: '>=', valor: 60 },
                { tipoDeAnalise: 'geral', time: 'casa', metrica: 'Ambas Marcam (%)', operador: '>=', valor: 50 },
                { tipoDeAnalise: 'h2h', time: 'casa', metrica: 'Ambas Marcam (%)', operador: '>=', valor: 50 },
                { tipoDeAnalise: 'geral', time: 'visitante', metrica: 'Ambas Marcam (%)', operador: '>=', valor: 50 },
                { tipoDeAnalise: 'h2h', time: 'visitante', metrica: 'Ambas Marcam (%)', operador: '>=', valor: 50 },
            ]
        },
    ];

    const metodosAtivados = useMemo(() => {
        const ativados: any[] = [];
        if (!homeStats || !awayStats) return ativados;

        const statsGeral = { casa: homeStats, visitante: awayStats };
        const statsH2H = { casa: h2hHomeStats, visitante: h2hAwayStats };
        
        const matchWinnerBet = comparisonData?.odds?.bookmakers[0]?.bets.find((bet: any) => bet.name === 'Match Winner');
        const oddsData = {
            casa: { Odd: parseFloat(matchWinnerBet?.values.find((v: any) => v.value === 'Home')?.odd || '0') },
            visitante: { Odd: parseFloat(matchWinnerBet?.values.find((v: any) => v.value === 'Away')?.odd || '0') },
        };

        todosOsMetodos.forEach(metodo => {
            let todasAsCondicoesBatem = true;
            
            for (const condicao of metodo.condicoes) {
                let dados;
                let valorDaEstatistica;
                let resultado = false;

                // MUDANÇA: Lógica de verificação agora inclui 'comparacao_odds'
                if (condicao.tipoDeAnalise === 'comparacao_odds') {
                    if (oddsData.casa.Odd && oddsData.visitante.Odd && oddsData.casa.Odd > 0) {
                        if (condicao.comparacao === 'casa_menor_igual_visitante') {
                            resultado = oddsData.casa.Odd <= oddsData.visitante.Odd;
                        }
                    }
                } else {
                    switch(condicao.tipoDeAnalise) {
                        case 'geral': dados = statsGeral; break;
                        case 'h2h': dados = statsH2H; break;
                        case 'odds': dados = oddsData; break;
                    }

                    if (!dados?.casa || !dados?.visitante) {
                        todasAsCondicoesBatem = false;
                        break;
                    }

                    valorDaEstatistica = Number(dados[condicao.time as keyof typeof dados]?.[condicao.metrica as keyof typeof homeStats]);
                    
                    switch (condicao.operador) {
                        case '>=': resultado = valorDaEstatistica >= condicao.valor; break;
                        case '<=': resultado = valorDaEstatistica <= condicao.valor; break;
                        case '==': resultado = valorDaEstatistica == condicao.valor; break;
                        case '>': resultado = valorDaEstatistica > condicao.valor; break;
                        case '<': resultado = valorDaEstatistica < condicao.valor; break;
                    }
                }

                if (!resultado) {
                    todasAsCondicoesBatem = false;
                    break;
                }
            }
            if (todasAsCondicoesBatem) {
                ativados.push(metodo);
            }
        });
        return ativados;
    }, [comparisonData, homeStats, awayStats, h2hHomeStats, h2hAwayStats]);


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-slate-50"><LoaderCircle className="animate-spin text-blue-600" size={48} /> Carregando diagnóstico...</div>;
    }
    if (error) {
        return <div className="text-center text-red-500 p-8">{error}</div>;
    }
    if (!comparisonData) {
        return <div className="text-center p-8">Nenhum dado encontrado para este confronto.</div>;
    }
    
    const statsToDisplay = {
        'Diagnóstico de Gols (Partida Completa)': ['Jogos Over 0.5 FT (%)', 'Jogos Over 1.5 FT (%)', 'Jogos Over 2.5 FT (%)', 'Jogos Over 3.5 FT (%)', 'Jogos Under 1.5 FT (%)', 'Jogos Under 2.5 FT (%)', 'Ambas Marcam (%)', 'Marcou Gol no FT (%)', 'Sofreu Gol no FT (%)'],
        'Diagnóstico de Gols (Por Tempo)': ['Marcou Gol no HT (%)', 'Sofreu Gol no HT (%)', 'Marcou o 1º gol (no HT)', 'Sofreu o 1º gol (no HT)', 'Jogos com Gol no 2ºT (%)', 'Marcou em Ambos os Tempos (%)'],
        'Diagnóstico de Performance/Força': ['Vitórias em Casa (%)', 'Vitórias Fora (%)', 'Jogos Sem Sofrer Gol (%)', 'Vitórias sem sofrer gols (%)', 'Jogos Sem Marcar Gol (%)', 'Goleadas Aplicadas (Venceu com 4+ gols)', 'Goleadas Sofridas (Perdeu com 4+ gols)'],
        'Diagnóstico de Cenários de Jogo': ['Jogos que tomou virada (%)',]
    };
    
    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="container mx-auto max-w-7xl py-6 px-2 sm:px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <ComparisonHeader teams={comparisonData.teams} />
                    {comparisonData.odds && <OddsDisplay oddsData={comparisonData.odds} />}
                    
                    <div className="p-4 md:p-6">
                        {metodosAtivados.length > 0 && (
                            <section className="mb-8 space-y-4">
                                {metodosAtivados.map(metodo => (
                                    <div key={metodo.nome} className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 shadow-md">
                                        <h2 className="text-2xl font-bold text-emerald-800">Oportunidade Encontrada: {metodo.nome}</h2>
                                        <p className="text-emerald-700 mt-1">
                                            {metodo.fraseFinal}
                                        </p>
                                        <div className="mt-4 border-t border-emerald-200 pt-3">
                                            <h4 className="font-bold text-emerald-800 mb-2">Critérios Verificados:</h4>
                                            <ul className="space-y-1">
                                                {metodo.condicoes.map((cond, index) => (
                                                    <li key={index} className="flex items-center text-sm text-emerald-900">
                                                        <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-500" />
                                                        {cond.tipoDeAnalise === 'comparacao_odds' ? (
                                                            <span className="font-semibold">Odds: {cond.texto}</span>
                                                        ) : (
                                                            <>
                                                                <span className="font-semibold">{cond.tipoDeAnalise === 'h2h' ? 'H2H' : cond.tipoDeAnalise === 'odds' ? 'Odds' : 'Geral'}:</span>
                                                                <span className="mx-1">{cond.time === 'casa' ? comparisonData.teams.home.name : comparisonData.teams.away.name}</span>
                                                                <span>- {cond.metrica.replace(' (%)', '')}</span>
                                                                <span className="font-bold mx-1">{cond.operador} {cond.valor}{cond.tipoDeAnalise !== 'odds' ? '%' : ''}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        <section>
                            <div className="text-center mb-6 mt-4">
                                <h2 className="text-2xl font-bold text-gray-800">Análise de Forma</h2>
                                <p className="text-base text-gray-500">Desempenho nos últimos 20 jogos</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {Object.entries(statsToDisplay).map(([category, stats]) => (
                                    <div key={category}>
                                        <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider pb-1 mb-1 border-b-2 border-gray-200">{category}</h3>
                                        <div className="space-y-0">
                                            {stats.map(statLabel => (
                                                <ComparisonStatRow
                                                    key={statLabel}
                                                    label={statLabel.replace(' (%)', '')}
                                                    homeValue={homeStats?.[statLabel as keyof typeof homeStats]}
                                                    awayValue={awayStats?.[statLabel as keyof typeof awayStats]}
                                                    homeColor="bg-blue-600"
                                                    awayColor="bg-cyan-500"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {h2hHomeStats && h2hAwayStats && (
                            <section className="border-t-2 border-gray-100 pt-6 mt-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Confronto Direto (H2H)</h2>
                                    <p className="text-base text-gray-500">Desempenho nos últimos 10 jogos entre eles</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {Object.entries(statsToDisplay).map(([category, stats]) => (
                                        <div key={category}>
                                            <h3 className="text-base font-bold text-gray-500 uppercase tracking-wider pb-1 mb-1 border-b-2 border-gray-200">{category}</h3>
                                            <div className="space-y-0">
                                                {stats.map(statLabel => (
                                                    <ComparisonStatRow
                                                        key={statLabel}
                                                        label={statLabel.replace(' (%)', '')}
                                                        homeValue={h2hHomeStats[statLabel as keyof typeof h2hHomeStats]}
                                                        awayValue={h2hAwayStats[statLabel as keyof typeof h2hAwayStats]}
                                                        homeColor="bg-indigo-600"
                                                        awayColor="bg-purple-500"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}