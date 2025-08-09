'use client';
import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { LoaderCircle, Search, ChevronDown, BrainCircuit, X, CornerUpLeft, Shield, Square, ExternalLink, Star, TrendingUp, Flame, ShieldAlert, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { RadarAnalysisChart } from './RadarChart';
import { BacktestAnalysisPanel } from './BacktestAnalysisPanel';

// Definição de tipo para os grupos de jogos para ajudar o TypeScript
type GameGroup = [string, { games: any[] }];

// Filtro de Ligas Permitidas
const ALLOWED_LEAGUE_IDS = [
    2, 3, 4, 5, 7, 9, 13, 14, 15, 11, 20, 21, 22, 24, 27, 31, 32, 37, 39, 40, 41, 42, 43, 45, 47, 48, 49, 50, 51, 66, 72, 73, 79, 84, 92, 96, 97, 98, 101, 102, 103, 106, 107, 108, 109, 114, 119, 120, 122, 123, 124, 125, 126, 128, 129, 130, 131, 136, 137, 140, 141, 163, 173, 174, 175, 176, 177, 178, 179, 182, 181, 184, 185, 135, 136, 203, 204, 212, 219, 220, 229, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 255, 256, 257, 262, 264, 271, 272, 282, 283, 281, 284, 285, 286, 292, 293, 294, 295, 304, 328, 329, 334, 345, 346, 347, 358, 366, 367, 392, 489, 78, 473, 474, 491, 501, 503, 523, 527, 531, 550, 558, 559, 633, 638, 497, 519, 529, 555, 556, 557, 592, 593, 548, 657, 702, 713, 722, 727, 760, 770, 772, 803, 807, 810, 4330, 4395, 4888, 4400, 79, 61, 62, 94, 88, 71, 72, 144, 147, 253, 113, 207, 208, 307, 203, 218, 15, 1, 2146, 2154
];

// 1. Função que calcula todas as estatísticas que seus métodos podem precisar
const calculateAllStatsForMethods = (teamId: number, teamForm: any[]) => {
    if (!teamForm || teamForm.length === 0) return {};
    const numGames = teamForm.length;
    let stats = {
        htGoalScored: 0,
        ftGoalScored: 0,
        htGoalConceded: 0,
        ftGoalConceded: 0,
        winsAtHome: 0,
        totalHomeGames: 0,
        over2_5: 0,
    };
    teamForm.forEach(game => {
        const isThisTeamHome = game.teams.home.id === teamId;
        const scored = isThisTeamHome ? game.goals.home : game.goals.away;
        const conceded = isThisTeamHome ? game.goals.away : game.goals.home;
        const htScored = isThisTeamHome ? game.score.halftime.home : game.score.halftime.away;
        const htConceded = isThisTeamHome ? game.score.halftime.away : game.score.halftime.home;
        const totalGoals = game.goals.home + game.goals.away;
        if (htScored > 0) stats.htGoalScored++;
        if (scored > 0) stats.ftGoalScored++;
        if (htConceded > 0) stats.htGoalConceded++;
        if (conceded > 0) stats.ftGoalConceded++;
        if (totalGoals > 2.5) stats.over2_5++;
        if (isThisTeamHome) {
            stats.totalHomeGames++;
            if (scored > conceded) stats.winsAtHome++;
        }
    });
    const toPercent = (value: number, total = numGames) => (total === 0 ? 0 : Math.round((value / total) * 100));
    return {
        marcouGolHTPercent: toPercent(stats.htGoalScored),
        marcouGolFTPercent: toPercent(stats.ftGoalScored),
        sofreuGolHTPercent: toPercent(stats.htGoalConceded),
        sofreuGolFTPercent: toPercent(stats.ftGoalConceded),
        homeWinPercent: toPercent(stats.winsAtHome, stats.totalHomeGames),
        over2_5FTPercent: toPercent(stats.over2_5),
    };
};

// 2. Array com a definição de todos os seus métodos
const metodos = [
    { name: 'ENTRADA LAY 0X1', checker: (homeStats: any, awayStats: any, odds: any) => { const homeScoredHT = (homeStats.marcouGolHTPercent || 0) >= 60; const homeScoredFT = (homeStats.marcouGolFTPercent || 0) >= 80; const awayConcededHT = (awayStats.sofreuGolHTPercent || 0) >= 30; const awayConcededFT = (awayStats.sofreuGolFTPercent || 0) >= 60; const oddsCondition = odds.home <= odds.away; return homeScoredHT && homeScoredFT && awayConcededHT && awayConcededFT && oddsCondition; } },
    { name: 'ENTRADA LAY 0X3', checker: (homeStats: any, awayStats: any, odds: any) => { const homeScoredHT = (homeStats.marcouGolHTPercent || 0) >= 50; const homeScoredFT = (homeStats.marcouGolFTPercent || 0) >= 80; const awayConcededFT = (awayStats.sofreuGolFTPercent || 0) >= 60; const oddsCondition = odds.home > 2.00 && odds.away > 2.80; const homeWinPercent = (homeStats.homeWinPercent || 0) >= 50; return homeScoredHT && homeScoredFT && awayConcededFT && oddsCondition && homeWinPercent; } },
    { name: 'ENTRADA LAY 2x2', checker: (homeStats: any, awayStats: any, odds: any) => { if (!odds.home) return false; const homeOddCondition = odds.home <= 1.40; const over25Condition = (homeStats.over2_5FTPercent || 0) >= 50; return homeOddCondition && over25Condition; } },
];

// 3. Função central que verifica todos os métodos de uma vez
const verificarMetodos = (analysisData: any) => {
    if (!analysisData || !analysisData.parameters || !analysisData.odds?.matchWinner || !analysisData.homeTeamForm || !analysisData.awayTeamForm) { return []; }
    const homeId = parseInt(analysisData.parameters.homeTeamId);
    const awayId = parseInt(analysisData.parameters.awayTeamId);
    const homeStats = calculateAllStatsForMethods(homeId, analysisData.homeTeamForm);
    const awayStats = calculateAllStatsForMethods(awayId, analysisData.awayTeamForm);
    const oddsValues = analysisData.odds.matchWinner?.bookmakers[0]?.bets[0]?.values;
    if (!oddsValues) return [];
    const homeOddValue = oddsValues.find((o: any) => o.value === 'Home')?.odd;
    const awayOddValue = oddsValues.find((o: any) => o.value === 'Away')?.odd;
    if (!homeOddValue || !awayOddValue) return [];
    const odds = { home: parseFloat(homeOddValue), away: parseFloat(awayOddValue) };
    const matchedMethods = [];
    for (const metodo of metodos) {
        if (metodo.checker(homeStats, awayStats, odds)) {
            matchedMethods.push(metodo.name);
        }
    }
    return matchedMethods;
};

const calculateDetailedStats = (teamForm: any[], teamId: number) => {
    if (!teamForm || teamForm.length === 0) return {};
    const numGames = teamForm.length;
    let stats = { htGoalScored: 0, over0_5: 0, over1_5: 0, over2_5: 0, over3_5: 0, under1_5: 0, under2_5: 0, lostAfterLeading: 0, scoredBothHalves: 0, winToNil: 0, blowoutsApplied: 0, blowoutsConceded: 0, scoredFirst: 0, concededFirst: 0, btts: 0, failedToScore: 0, cleanSheets: 0, scoredInST: 0, winsAtHome: 0, totalHomeGames: 0, winsAway: 0, totalAwayGames: 0 };
    teamForm.forEach(game => {
        const isThisTeamHome = game.teams.home.id === teamId;
        const scored = isThisTeamHome ? game.goals.home : game.goals.away;
        const conceded = isThisTeamHome ? game.goals.away : game.goals.home;
        const htScored = isThisTeamHome ? game.score.halftime.home : game.score.halftime.away;
        const htConceded = isThisTeamHome ? game.score.halftime.away : game.score.halftime.home;
        const stScored = scored - (htScored || 0);
        const totalGoals = game.goals.home + game.goals.away;
        if (totalGoals > 0.5) stats.over0_5++;
        if (totalGoals < 1.5) stats.under1_5++;
        if (totalGoals < 2.5) stats.under2_5++;
        if (htScored > htConceded && scored < conceded) stats.lostAfterLeading++;
        if (htScored > 0 && stScored > 0) stats.scoredBothHalves++;
        if (scored > conceded && conceded === 0) stats.winToNil++;
        if (htScored > 0) stats.htGoalScored++;
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
        'Jogos com gol no HT (%)': toPercent(stats.htGoalScored), 'Jogos Over 0.5 FT (%)': toPercent(stats.over0_5), 'Jogos Over 1.5 FT (%)': toPercent(stats.over1_5), 'Jogos Over 2.5 FT (%)': toPercent(stats.over2_5), 'Jogos Over 3.5 FT (%)': toPercent(stats.over3_5), 'Jogos Under 1.5 FT (%)': toPercent(stats.under1_5), 'Jogos Under 2.5 FT (%)': toPercent(stats.under2_5), 'Ambas Marcam (%)': toPercent(stats.btts), 'Marcou em Ambos os Tempos (%)': toPercent(stats.scoredBothHalves), 'Vitórias sem sofrer gols (%)': toPercent(stats.winToNil), 'Goleadas Aplicadas (Venceu com 4+ gols)': toPercent(stats.blowoutsApplied), 'Goleadas Sofridas (Perdeu com 4+ gols)': toPercent(stats.blowoutsConceded), 'Jogos que tomou virada (%)': toPercent(stats.lostAfterLeading), 'Marcou o 1º gol (no HT)': toPercent(stats.scoredFirst), 'Sofreu o 1º gol (no HT)': toPercent(stats.concededFirst), 'Jogos Sem Marcar Gol (%)': toPercent(stats.failedToScore), 'Jogos Sem Sofrer Gol (%)': toPercent(stats.cleanSheets), 'Jogos com Gol no 2ºT (%)': toPercent(stats.scoredInST), 'Vitórias em Casa (%)': toPercent(stats.winsAtHome, stats.totalHomeGames), 'Vitórias Fora (%)': toPercent(stats.winsAway, stats.totalAwayGames),
    };
};

const calculatePowerScore = (stats: Record<string, string>) => {
    if (Object.keys(stats).length === 0) return 0;
    let score = 0;
    score += parseInt(stats['Jogos Over 2.5 FT (%)']) * 0.20;
    score += parseInt(stats['Goleadas Aplicadas (Venceu com 4+ gols)']) * 0.15;
    score += parseInt(stats['Vitórias em Casa (%)']) * 0.15;
    score += parseInt(stats['Vitórias Fora (%)']) * 0.20;
    score += parseInt(stats['Jogos com Gol no 2ºT (%)']) * 0.10;
    score += parseInt(stats['Jogos Sem Sofrer Gol (%)']) * 0.15;
    score -= parseInt(stats['Goleadas Sofridas (Perdeu com 4+ gols)']) * 0.15;
    score -= parseInt(stats['Jogos Sem Marcar Gol (%)']) * 0.10;
    return Math.max(0, Math.min(100, Math.round(score)));
}

const PowerScoreDisplay = ({ score }: { score: number }) => {
    let icon = <ShieldAlert size={24} className="text-gray-400" />;
    let text = "Neutro";
    let color = "text-gray-500";
    if (score >= 75) {
        icon = <Flame size={24} className="text-red-500" />;
        text = "Muito Forte";
        color = "text-red-600";
    } else if (score >= 50) {
        icon = <TrendingUp size={24} className="text-green-500" />;
        text = "Forte";
        color = "text-green-600";
    } else if (score < 30) {
        icon = <TrendingDown size={24} className="text-yellow-500" />;
        text = "Fraco";
        color = "text-yellow-600";
    }
    return (
        <div className="flex flex-col items-center justify-center text-center">
            {icon}
            <p className={`font-bold text-xl ${color}`}>{score}</p>
            <p className="text-xs text-gray-500">{text}</p>
        </div>
    );
};

// ============================================================================
// SEÇÃO DE SUB-COMPONENTES
// ============================================================================

const GameRow = ({ fixture }: any) => (
    <div className="flex items-center p-2 bg-gray-200 rounded-md text-sm my-1">
        <span className="text-gray-600 font-semibold mr-2 w-1/5">{new Date(fixture.fixture.date).toLocaleDateString()}</span>
        <div className="flex items-center flex-1">
            <span className="text-right w-2/5 truncate font-bold text-black">{fixture.teams.home.name}</span>
            <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} width={16} height={16} className="mx-2" unoptimized />
            <span className="font-bold bg-gray-300 text-black px-2 py-0.5 rounded-md">{fixture.goals.home} - {fixture.goals.away}</span>
            <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} width={16} height={16} className="mx-2" unoptimized />
            <span className="w-2/5 truncate font-bold text-black">{fixture.teams.away.name}</span>
        </div>
    </div>
);

const CollapsibleGameRow = ({ fixture }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const getStat = (teamId: number, statName: string) => {
        const teamStats = fixture.statistics?.find((s: any) => s.team.id === teamId);
        const stat = teamStats?.statistics.find((item: any) => item.type === statName);
        return stat?.value ?? '-';
    };
    const homeId = fixture.teams.home.id;
    const awayId = fixture.teams.away.id;
    const halftimeScore = `${fixture.score.halftime.home ?? '?'} - ${fixture.score.halftime.away ?? '?'}`;
    return (
        <div className="bg-white p-3 rounded-lg my-1 border border-gray-200 shadow-sm transition-all duration-300">
            <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex-1 flex items-center justify-end">
                    <span className="text-right font-bold text-black text-sm truncate mr-2">{fixture.teams.home.name}</span>
                    <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} width={20} height={20} unoptimized />
                </div>
                <span className="font-bold bg-gray-200 text-black px-3 py-1 rounded-md text-base mx-3">{fixture.goals.home} - {fixture.goals.away}</span>
                <div className="flex-1 flex items-center">
                    <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} width={20} height={20} unoptimized />
                    <span className="text-left font-bold text-black text-sm truncate ml-2">{fixture.teams.away.name}</span>
                </div>
                <ChevronDown size={20} className={`text-gray-500 ml-auto transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs animate-fade-in">
                    <div className="text-center text-black-600 mb-3">1º Tempo: {halftimeScore}</div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center"><span>{getStat(homeId, 'Shots on Goal')}</span><span className="text-green-600">Chutes no Gol</span><span>{getStat(awayId, 'Shots on Goal')}</span></div>
                        <div className="flex justify-between items-center"><span>{getStat(homeId, 'Total Shots')}</span><span className="text-green-600">Total de Chutes</span><span>{getStat(awayId, 'Total Shots')}</span></div>
                        <div className="flex justify-between items-center"><span>{getStat(homeId, 'Corner Kicks')}</span><span className="text-green-600 flex items-center gap-1"><CornerUpLeft size={14}/> Escanteios</span><span>{getStat(awayId, 'Corner Kicks')}</span></div>
                        <div className="flex justify-between items-center"><span>{getStat(homeId, 'Fouls')}</span><span className="text-green-600 flex items-center gap-1"><Shield size={14}/> Faltas</span><span>{getStat(awayId, 'Fouls')}</span></div>
                        <div className="flex justify-between items-center"><span>{getStat(homeId, 'Yellow Cards')}</span><span className="text-green-600 flex items-center gap-1"><Square size={14} className="text-yellow-500 fill-current"/> Cartões Amarelos</span><span>{getStat(awayId, 'Yellow Cards')}</span></div>
                        <div className="flex justify-between items-center"><span>{getStat(homeId, 'Red Cards')}</span><span className="text-green-600 flex items-center gap-1"><Square size={14} className="text-red-600 fill-current"/> Cartões Vermelhos</span><span>{getStat(awayId, 'Red Cards')}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TeamFormAnalysis = ({ teamName, teamId, teamForm, venueFilter }: { teamName: string, teamId: number, teamForm: any[], venueFilter?: 'Home' | 'Away' }) => {
    const filteredGames = useMemo(() => {
        if (!teamForm || teamForm.length === 0) return [];
        if (!venueFilter) return teamForm;
        return teamForm.filter(game => {
            if (venueFilter === 'Home') return game.teams.home.id === teamId;
            return game.teams.away.id === teamId;
        });
    }, [teamForm, teamId, venueFilter]);

    if (!teamForm || teamForm.length === 0) {
        return <p className="text-gray-500 text-center text-sm py-2">Dados de forma não disponíveis.</p>;
    }

    if (filteredGames.length === 0) {
        return (
            <div>
                <h4 className="font-bold mb-2 text-black text-center text-sm">{teamName}</h4>
                <p className="text-gray-500 text-center text-xs py-2">Nenhum jogo encontrado para este filtro.</p>
            </div>
        );
    }
    
    const formResults = filteredGames.map(game => {
        const isHome = game.teams.home.id === teamId;
        const goalsFor = isHome ? game.goals.home : game.goals.away;
        const goalsAgainst = isHome ? game.goals.away : game.goals.home;
        if (goalsFor > goalsAgainst) return 'V';
        if (goalsFor < goalsAgainst) return 'D';
        return 'E';
    });

    return (
        <div>
            <h4 className="font-bold mb-2 text-black text-center text-sm">{teamName}</h4>
            <div className="flex justify-center space-x-1 mb-3">
                {formResults.map((result, index) => (
                    <span key={index} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${result === 'V' ? 'bg-green-500 text-white' : result === 'D' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>{result}</span>
                ))}
            </div>
            <div className="space-y-1">
                {filteredGames.map((game) => <CollapsibleGameRow key={game.fixture.id} fixture={game} />)}
            </div>
        </div>
    );
};

const OddMarket = ({ title, oddsData }: { title: string, oddsData: any }) => {
    if (!oddsData || !oddsData.bookmakers[0]?.bets[0]?.values) {
        return (
            <div>
                <h5 className="font-bold text-gray-800 mb-2">{title}</h5>
                <p className="text-gray-500 text-center text-xs py-2">Não disponível.</p>
            </div>
        );
    }
    return (
        <div>
            <h5 className="font-bold text-gray-800 mb-2">{title}</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center">
                {oddsData.bookmakers[0].bets[0].values.map((odd: any) => {
                    const isOver = odd.value.startsWith('Over');
                    const bgColor = isOver ? 'bg-green-100' : 'bg-red-100';
                    const textColor = isOver ? 'text-green-800' : 'text-red-800';
                    const oddColor = isOver ? 'text-green-900' : 'text-red-900';
                    if (title === 'Vencedor da Partida') {
                        return (
                            <div key={odd.value} className="bg-blue-200 p-2 rounded-md">
                                <p className="text-xs text-blue-800">{odd.value}</p>
                                <p className="font-bold text-blue-800">{odd.odd}</p>
                            </div>
                        );
                    }
                    return (
                        <div key={odd.value} className={`${bgColor} p-2 rounded-md`}>
                            <p className={`text-xs font-medium ${textColor}`}>{odd.value}</p>
                            <p className={`font-bold ${oddColor}`}>{odd.odd}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AiAnalysisModal = ({ fixtureData, analysisData, pageData, onClose }: any) => {
    const { teams, league } = fixtureData;
    const generateDetailedAnalysis = () => {
        if (!analysisData || !pageData.standings[league.id] || !analysisData.homeTeamForm) { return { summary: "Dados insuficientes para gerar uma análise completa.", suggestion: null }; }
        const { h2h, homeTeamForm, awayTeamForm } = analysisData;
        const standings = pageData.standings[league.id];
        let homeScore = 0; let awayScore = 0; let summary = [];
        const homeRank = standings.find((t: any) => t.team.id === teams.home.id)?.rank ?? 50;
        const awayRank = standings.find((t: any) => t.team.id === teams.away.id)?.rank ?? 50;
        if (homeRank < awayRank) homeScore += 2; else if (awayRank < homeRank) awayScore += 2;
        summary.push(`O ${teams.home.name} está na ${homeRank}ª posição, enquanto o ${teams.away.name} está na ${awayRank}ª.`);
        const getFormScore = (form: any[], teamId: number) => form.reduce((score, game) => { const isHome = game.teams.home.id === teamId; const goalsFor = isHome ? game.goals.home : game.goals.away; const goalsAgainst = isHome ? game.goals.away : game.goals.home; if (goalsFor > goalsAgainst) return score + 3; if (goalsFor === goalsAgainst) return score + 1; return score; }, 0);
        const homeFormScore = getFormScore(homeTeamForm, teams.home.id);
        const awayFormScore = getFormScore(awayTeamForm, teams.away.id);
        if (homeFormScore > awayFormScore) homeScore += 1.5; else if (awayFormScore > homeFormScore) awayScore += 1.5;
        summary.push(`Em termos de forma, o ${teams.home.name} somou ${homeFormScore} pontos nos últimos ${homeTeamForm.length} jogos, e o ${teams.away.name} somou ${awayFormScore}.`);
        const getGoalAvg = (form: any[], teamId: number) => { if (!form || form.length === 0) return { scored: 0, conceded: 0 }; const metrics = form.reduce((acc, game) => { const isThisTeamHome = game.teams.home.id === teamId; acc.scored += isThisTeamHome ? game.goals.home : game.goals.away; acc.conceded += isThisTeamHome ? game.goals.away : game.goals.home; return acc; }, { scored: 0, conceded: 0 }); return { scored: metrics.scored / form.length, conceded: metrics.conceded / form.length }; };
        const homeGoals = getGoalAvg(homeTeamForm, teams.home.id);
        const awayGoals = getGoalAvg(awayTeamForm, teams.away.id);
        if (homeGoals.scored > awayGoals.scored) homeScore += 1; else if (awayGoals.scored > homeGoals.scored) awayScore += 1;
        if (homeGoals.conceded < awayGoals.conceded) homeScore += 1; else if (awayGoals.conceded < homeGoals.conceded) awayScore += 1;
        summary.push(`A média de golos marcados é de ${homeGoals.scored.toFixed(2)} para a equipa da casa e ${awayGoals.scored.toFixed(2)} para a visitante.`);
        if (h2h.length > 0) { const lastH2h = h2h[0]; if (lastH2h.teams.home.winner) homeScore += 1; if (lastH2h.teams.away.winner) awayScore += 1; summary.push(`No último confronto direto, o resultado foi ${lastH2h.teams.home.name} ${lastH2h.goals.home} x ${lastH2h.goals.away} ${lastH2h.teams.away.name}.`); }
        let suggestion = "Jogo equilibrado, sem uma entrada clara de valor.";
        const avgGoals = (homeGoals.scored + awayGoals.scored) / 2;
        const goalDiff = Math.abs(homeGoals.scored - awayGoals.scored);
        const totalScoreDiff = homeScore - awayScore;
        if (homeScore > awayScore + 2) { suggestion = `Back ${teams.home.name}: A análise mostra uma vantagem considerável para a equipa da casa.`; } else if (awayScore > homeScore + 2) { suggestion = `Back ${teams.away.name}: A análise aponta para um favoritismo da equipa visitante.`; } else if (avgGoals > 2.5) { suggestion = "Over 2.5 Golos: Ambas as equipas têm bom potencial ofensivo, sugerindo um jogo com gols."; } else if (avgGoals < 1.5) { suggestion = "Under 2.5 Golos: Espera-se um jogo mais defensivo e com poucos gols."; } else if (goalDiff > 1) { suggestion = "Possível vitória clara: Diferença significativa na média de gols entre as equipas."; } else if (totalScoreDiff >= 1) { suggestion = "Leve favoritismo para a equipa da casa baseado na análise geral."; } else if (totalScoreDiff <= -1) { suggestion = "Leve favoritismo para a equipa visitante baseado na análise geral."; } else if (homeFormScore > awayFormScore + 3) { suggestion = `Equipe da casa (${teams.home.name}) em melhor forma recente, pode fazer a diferença.`; } else if (awayFormScore > homeFormScore + 3) { suggestion = `Equipe visitante (${teams.away.name}) em melhor forma recente, atenção para surpresa.`; } else { suggestion = "Jogo equilibrado, pode ser definido por detalhes ou bola parada."; }
        return { summary: summary.join(' '), suggestion };
    };
    const { summary, suggestion } = generateDetailedAnalysis();
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={24} /></button>
                <div className="flex items-center gap-3 mb-4"><BrainCircuit className="w-8 h-8 text-blue-600" /><h2 className="text-2xl font-bold">Dicas Tipsdicas - Análise IA</h2></div>
                <div className="space-y-4 text-sm">
                    <div><h4 className="font-bold text-base text-gray-900">Resumo do Confronto:</h4><p className="text-gray-700">{summary}</p></div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4"><h4 className="font-bold text-base text-gray-900">Palpite Final:</h4><p className="text-gray-800 font-semibold">{suggestion}</p></div>
                </div>
            </div>
        </div>
    );
};

const LineupsPanel = ({ lineupData }: { lineupData: any[] }) => {
    if (!lineupData || lineupData.length < 2) { return <p className="text-gray-500 text-center text-sm py-2">Escalações não disponíveis.</p>; }
    const homeLineup = lineupData[0];
    const awayLineup = lineupData[1];
    const PlayerList = ({ title, players }: { title: string, players: any[] }) => (
    <div>
        <h5 className="font-bold text-sm mb-2 text-gray-800">{title}</h5>
        <ul className="space-y-1 text-xs">
            {/* Adicionamos a verificação "players &&" antes do map */}
            {players && players.map(p => (
                <li key={p.player.id} className="p-1 bg-gray-100 rounded">
                    <span className="font-semibold text-gray-600 mr-2">{p.player.number}</span>
                    {p.player.name}
                </li>
            ))}
        </ul>
    </div>
);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <div className="flex items-center gap-2 mb-3"><Image src={homeLineup.team.logo} alt={homeLineup.team.name} width={24} height={24} unoptimized /><p className="font-bold text-base text-black">{homeLineup.team.name} ({homeLineup.formation})</p></div>
                <div className="space-y-4"><PlayerList title="Titulares" players={homeLineup.startXI} /><PlayerList title="Reservas" players={homeLineup.substitutes} /></div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-3"><Image src={awayLineup.team.logo} alt={awayLineup.team.name} width={24} height={24} unoptimized /><p className="font-bold text-base text-black">{awayLineup.team.name} ({awayLineup.formation})</p></div>
                <div className="space-y-4"><PlayerList title="Titulares" players={awayLineup.startXI} /><PlayerList title="Reservas" players={awayLineup.substitutes} /></div>
            </div>
        </div>
    );
};

const RecentGamesStatsPanel = ({ homeTeamForm, awayTeamForm, homeId, awayId }: any) => {
    const homeStats = calculateDetailedStats(homeTeamForm, homeId);
    const awayStats = calculateDetailedStats(awayTeamForm, awayId);
    const statLabels = Object.keys(homeStats);
    return (
        <div className="space-y-3 text-xs">{statLabels.map(label => (<div key={label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><div className="flex items-center justify-end"><span className="font-bold text-gray-700 mr-2">{homeStats[label]}%</span><div className="w-20 bg-gray-200 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${homeStats[label]}%` }}></div></div></div><div className="text-center text-gray-500 font-semibold px-1">{label}</div><div className="flex items-center"><div className="w-20 bg-gray-200 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${awayStats[label]}%` }}></div></div><span className="font-bold text-gray-700 ml-2">{awayStats[label]}%</span></div></div>))}</div>
    );
};

const GameHeader = ({ fixtureData, analysisData }: any) => {
    const { fixture, teams, league, goals, score } = fixtureData;
    const oddsValues = analysisData?.odds?.matchWinner?.bookmakers[0]?.bets[0]?.values;
    const homeOdd = oddsValues?.find((o: any) => o.value === 'Home')?.odd || '-';
    const drawOdd = oddsValues?.find((o: any) => o.value === 'Draw')?.odd || '-';
    const awayOdd = oddsValues?.find((o: any) => o.value === 'Away')?.odd || '-';
    const gameDate = new Date(fixture.date);
    const formattedDate = gameDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = gameDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const isNotStarted = fixture.status.short === 'NS';
    const fullTimeScore = `${goals.home ?? ''} - ${goals.away ?? ''}`;
    const halfTimeScore = `(1T: ${score.halftime.home ?? '?'} - ${score.halftime.away ?? '?'})`;
    const fullTBetURL = "https://fulltbet.bet.br/b/exchange";
    return (
        <div className="mb-4">
            <div className="grid grid-cols-3 items-center text-center">
                <div className="flex flex-col items-center"><Image src={teams.home.logo} alt={teams.home.name} width={56} height={56} className="h-14 w-14 object-contain" unoptimized /><h3 className="font-bold text-black mt-2 text-base">{teams.home.name}</h3></div>
                <div className="px-2">{isNotStarted ? (<div className="text-2xl font-bold text-gray-700">{formattedTime}</div>) : (<div className="text-4xl font-bold text-black">{fullTimeScore}</div>)}<p className="text-xs text-green-600 mt-1">{isNotStarted ? formattedDate : `${fixture.status.long} ${halfTimeScore}`}</p></div>
                <div className="flex flex-col items-center"><Image src={teams.away.logo} alt={teams.away.name} width={56} height={56} className="h-14 w-14 object-contain" unoptimized /><h3 className="font-bold text-black mt-2 text-base">{teams.away.name}</h3></div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center bg-blue-200 p-2 rounded-lg">
                <div><p className="text-xs text-green-700">Casa</p><p className="font-bold text-black text-sm">{homeOdd}</p></div>
                <div><p className="text-xs text-gray-900">Empate</p><p className="font-bold text-black text-sm">{drawOdd}</p></div>
                <div><p className="text-xs text-red-500">Fora</p><p className="font-bold text-black text-sm">{awayOdd}</p></div>
            </div>
            <div className="mt-4"><a href={fullTBetURL} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"><ExternalLink size={16} /> Procurar Jogo na FullTBet</a></div>
        </div>
    );
};

const AnalysisPanelSkeleton = ({ fixtureData }: any) => {
    const { teams, fixture, goals } = fixtureData;
    return (
        <div className="bg-white p-4 rounded-b-lg text-black border-t-2 border-blue-600 animate-pulse">
            <div className="flex items-center justify-between mb-4"><div className="text-center w-1/3"><Image src={teams.home.logo} alt={teams.home.name} width={48} height={48} className="mx-auto h-auto" unoptimized /><p className="font-bold mt-1 text-sm">{teams.home.name}</p></div><div className="text-center">{fixture.status.short === 'NS' ? <p className="text-3xl font-light">vs</p> : <p className="text-3xl font-bold">{goals.home ?? '-'} : {goals.away ?? '-'}</p>}<p className="text-xs text-red-500">{fixture.status.long}</p></div><div className="text-center w-1/3"><Image src={teams.away.logo} alt={teams.away.name} width={48} height={48} className="mx-auto h-auto" unoptimized /><p className="font-bold mt-1 text-sm">{teams.away.name}</p></div></div>
            <div className="space-y-4"><div className="h-12 bg-gray-200 rounded-md w-full"></div><div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto mb-4"></div><div className="flex -mb-px border-b border-gray-200"><div className="w-20 h-8 bg-gray-200 rounded-t-lg mr-2"></div><div className="w-20 h-8 bg-gray-200 rounded-t-lg mr-2"></div><div className="w-20 h-8 bg-gray-200 rounded-t-lg mr-2"></div></div><div className="pt-4 min-h-[250px] space-y-3"><div className="h-6 bg-gray-200 rounded-md"></div><div className="h-6 bg-gray-200 rounded-md"></div><div className="h-6 bg-gray-200 rounded-md"></div><div className="h-6 bg-gray-200 rounded-md"></div></div></div>
        </div>
    );
};

const AnalysisPanel = ({ fixtureData, analysisData, pageData, onOpenModal }: any) => {
    const [activeTab, setActiveTab] = useState('radar');
    const [formView, setFormView] = useState<'all' | 'home' | 'away'>('all');
    
    const { teams, league } = fixtureData;

    const goalAverages = useMemo(() => {
        const calculate = (teamForm: any[], teamId: number) => {
            if (!teamForm || teamForm.length === 0) return { scored: 0, conceded: 0 };
            const metrics = teamForm.reduce((acc, game) => {
                const isThisTeamHome = game.teams.home.id === teamId;
                acc.scored += isThisTeamHome ? game.goals.home : game.goals.away;
                acc.conceded += isThisTeamHome ? game.goals.away : game.goals.home;
                return acc;
            }, { scored: 0, conceded: 0 });
            const numGames = teamForm.length;
            return { scored: metrics.scored / numGames, conceded: metrics.conceded / numGames };
        };
        
        if (!analysisData || !analysisData.homeTeamForm || !analysisData.awayTeamForm) {
            return null;
        }

        const home = calculate(analysisData.homeTeamForm, teams.home.id);
        const away = calculate(analysisData.awayTeamForm, teams.away.id);
        return { home, away };
    }, [analysisData, teams.home.id, teams.away.id]);

    const powerScores = useMemo(() => {
        if (!analysisData || !analysisData.homeTeamForm || !analysisData.awayTeamForm) {
            return { home: 0, away: 0 };
        }
        const homeStats = calculateDetailedStats(analysisData.homeTeamForm, fixtureData.teams.home.id);
        const awayStats = calculateDetailedStats(analysisData.awayTeamForm, fixtureData.teams.away.id);

        return {
            home: calculatePowerScore(homeStats),
            away: calculatePowerScore(awayStats)
        };
    }, [analysisData, fixtureData.teams]);
    
    const matchedMethods = useMemo(() => verificarMetodos(analysisData), [analysisData]);

    return (
        <div className="bg-white p-4 rounded-b-lg text-black border-t-2 border-blue-500">
            <GameHeader fixtureData={fixtureData} analysisData={analysisData} />
            
            {/* ### LAYOUT ALTERADO AQUI ### */}
            <div className="grid grid-cols-3 gap-4 text-center border-y py-3 my-4 items-center">
                {/* Coluna 1: Média do Time da Casa */}
                {goalAverages && (
                    <div className="text-center">
                        <p className="font-bold text-sm text-gray-800">Média (Últimos {analysisData.homeTeamForm.length} Jogos)</p>
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-green-700 font-semibold">⚽ Marcados: <span className="text-base font-bold">{goalAverages.home.scored.toFixed(2)}</span></p>
                            <p className="text-xs text-red-700 font-semibold">🛡️ Sofridos: <span className="text-base font-bold">{goalAverages.home.conceded.toFixed(2)}</span></p>
                        </div>
                    </div>
                )}

                {/* Coluna 2: TIPSSCORE e os dois índices de força */}
                <div className="flex flex-col items-center justify-center">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">TIPSSCORE</h4>
                    <div className="flex items-center gap-4">
                        <PowerScoreDisplay score={powerScores.home} />
                        <PowerScoreDisplay score={powerScores.away} />
                    </div>
                </div>

                {/* Coluna 3: Média do Time Visitante */}
                {goalAverages && (
                    <div className="text-center">
                        <p className="font-bold text-sm text-gray-800">Média (Últimos {analysisData.awayTeamForm.length} Jogos)</p>
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-green-700 font-semibold">⚽ Marcados: <span className="text-base font-bold">{goalAverages.away.scored.toFixed(2)}</span></p>
                            <p className="text-xs text-red-700 font-semibold">🛡️ Sofridos: <span className="text-base font-bold">{goalAverages.away.conceded.toFixed(2)}</span></p>
                        </div>
                    </div>
                )}
            </div>

            {matchedMethods.length > 0 && (
    matchedMethods.map(methodName => (
        <div key={methodName} className="my-4 p-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg shadow-md text-center">
            <p className="font-bold text-lg">Oportunidade Encontrada!</p>
            <p className="text-sm">Este jogo corresponde aos critérios do método: <strong>{methodName}</strong></p>
        </div>
    ))
)}

            <button onClick={() => onOpenModal(fixtureData)} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors mb-4"><BrainCircuit size={20} /> Ver Análise da IA</button>
            
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
                <ul className="flex flex-wrap -mb-px">
                    <li className="mr-2"><button onClick={() => setActiveTab('stats')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'stats' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Estatísticas %</button></li>
                    <li className="mr-2"><button onClick={() => setActiveTab('radar')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'radar' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Radar</button></li>
                    <li className="mr-2"><button onClick={() => setActiveTab('h2h')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'h2h' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Confroto direto</button></li>
                    <li className="mr-2"><button onClick={() => setActiveTab('form')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'form' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Confrontos</button></li>
                    <li className="mr-2"><button onClick={() => setActiveTab('standings')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'standings' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Classificação</button></li>
                    <li className="mr-2"><button onClick={() => setActiveTab('lineups')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'lineups' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Escalações</button></li>
                    <li className="mr-2"><button onClick={() => setActiveTab('odds')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'odds' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Odds</button></li>
                    <li className="mr-2"><button onClick={() => setActiveTab('backtest')} className={`inline-block p-2 border-b-2 rounded-t-lg ${activeTab === 'backtest' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600'}`}>Grafico%</button></li>
                </ul>
            </div>
            <div className="pt-4 min-h-[250px]">
                {activeTab === 'stats' && <RecentGamesStatsPanel homeTeamForm={analysisData.homeTeamForm} awayTeamForm={analysisData.awayTeamForm} homeId={teams.home.id} awayId={teams.away.id} />}
                {activeTab === 'radar' && <RadarAnalysisChart analysisData={analysisData} homeName={teams.home.name} awayName={teams.away.name} homeId={teams.home.id} awayId={teams.away.id} />}
                {activeTab === 'h2h' && <div className="space-y-1">{analysisData.h2h.length > 0 ? analysisData.h2h.map((game: any) => <GameRow key={game.fixture.id} fixture={game} />) : <p>Sem confrontos diretos.</p>}</div>}
                
                {activeTab === 'form' && (
                    <div>
                        <div className="flex justify-center gap-2 mb-4">
                            <button onClick={() => setFormView('all')} className={`px-3 py-1 text-xs font-semibold rounded-full ${formView === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Últimos Jogos</button>
                            <button onClick={() => setFormView('home')} className={`px-3 py-1 text-xs font-semibold rounded-full ${formView === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Apenas em Casa</button>
                            <button onClick={() => setFormView('away')} className={`px-3 py-1 text-xs font-semibold rounded-full ${formView === 'away' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Apenas Fora</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TeamFormAnalysis 
                                teamName={teams.home.name} 
                                teamId={teams.home.id} 
                                teamForm={analysisData.homeTeamForm}
                                venueFilter={formView === 'all' ? undefined : (formView === 'home' ? 'Home' : 'Away')}
                            />
                            <TeamFormAnalysis 
                                teamName={teams.away.name} 
                                teamId={teams.away.id} 
                                teamForm={analysisData.awayTeamForm}
                                venueFilter={formView === 'all' ? undefined : (formView === 'home' ? 'Home' : 'Away')}
                            />
                        </div>
                    </div>
                )}
                
                {activeTab === 'standings' && (pageData.standings && pageData.standings[league.id] && pageData.standings[league.id].length > 0 ? ( <table className="w-full text-left text-sm"><thead className="text-xs text-gray-900 uppercase bg-gray-50"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Time</th><th className="px-2 py-2">J</th><th className="px-2 py-2">SG</th><th className="px-2 py-2">Pts</th></tr></thead><tbody>{pageData.standings[league.id].map((team: any) => <tr key={team.team.id} className={`border-b ${team.team.id === teams.home.id || team.team.id === teams.away.id ? 'bg-blue-100' : ''}`}><td className="px-2 py-2">{team.rank}</td><td className="px-2 py-2 flex items-center">{team.team.logo ? (<Image src={team.team.logo} alt={team.team.name} width={16} height={16} unoptimized className="mr-2" />) : (<div className="w-4 h-4 mr-2 bg-gray-200 rounded-full flex-shrink-0"></div>)}{team.team.name}</td><td className="px-2 py-2">{team.all.played}</td><td className="px-2 py-2">{team.goalsDiff}</td><td className="px-2 py-2 font-bold">{team.points}</td></tr>)}</tbody></table> ) : ( <p className="text-gray-500 text-center text-sm py-2">A classificação não está disponível para este tipo de campeonato.</p>))}
                {activeTab === 'lineups' && <LineupsPanel lineupData={analysisData.lineup} />}
                {activeTab === 'odds' && (<div className="space-y-4"><OddMarket title="Vencedor da Partida" oddsData={analysisData.odds.matchWinner} /><OddMarket title="Mais/Menos" oddsData={analysisData.odds.overUnder_2_5} /></div>)}
                {activeTab === 'backtest' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><BacktestAnalysisPanel teamForm={analysisData.homeTeamForm} teamId={teams.home.id} teamName={teams.home.name} /><BacktestAnalysisPanel teamForm={analysisData.awayTeamForm} teamId={teams.away.id} teamName={teams.away.name} /></div>)}
            </div>
        </div>
    );
};

// ============================================================================
// SEÇÃO DOS NOVOS COMPONENTES DE COLUNA
// ============================================================================

const ColunaFiltros = ({ activeDate, setActiveDate, selectedLeague, setSelectedLeague, searchQuery, setSearchQuery, uniqueLeagues, groupBy, setGroupBy }: any) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full overflow-y-auto">
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-black">Data</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <button onClick={() => setActiveDate('today')} className={`p-2 rounded-md text-sm font-bold transition-colors ${activeDate === 'today' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Hoje</button>
                        <button onClick={() => setActiveDate('tomorrow')} className={`p-2 rounded-md text-sm font-bold transition-colors ${activeDate === 'tomorrow' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Amanhã</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="league-filter" className="text-sm font-bold text-black">Campeonato</label>
                    <select id="league-filter" value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="mt-1 w-full bg-gray-50 border border-gray-300 text-black rounded-md p-2 focus:ring-1 focus:ring-blue-500">
                        <option value="all">Todos os Campeonatos</option>
                        {uniqueLeagues.map((league: any) => (<option key={league.id} value={league.id}>{league.name} - {league.country}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="search-filter" className="text-sm font-bold text-black">Buscar</label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input id="search-filter" onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} type="text" placeholder="Time ou competição..." className="w-full bg-gray-50 border border-gray-300 text-black rounded-md p-2 pl-10 pr-10 focus:ring-1 focus:ring-blue-500" />
                        {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"><X size={18} /></button>)}
                    </div>
                </div>
                 <div className="items-end pt-4 border-t">
                <div>
                    <label className="text-sm font-bold text-black">Ordenar por</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <button onClick={() => setGroupBy('league')} className={`p-2 rounded-md text-sm font-bold transition-colors ${groupBy === 'league' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Torneio</button>
                        <button onClick={() => setGroupBy('time')} className={`p-2 rounded-md text-sm font-bold transition-colors ${groupBy === 'time' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>Horário</button>
                    </div>
                </div>
            </div>
             <div className="flex justify-end pt-2 border-t mt-4">
                 <Link href="/scanner">
                     <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2">
                         🔍 Ir para Scanner
                     </button>
                 </Link>
             </div>
        </div>
    </div>
    );
};

// ### MUDANÇA 1: NOVO COMPONENTE PARA OS BOTÕES DE FILTRO ###
const GameStatusFilters = ({ counts, activeFilter, onFilterChange }: any) => {
    const filters = [
        { key: 'all', label: 'Todos' },
        { key: 'not_started', label: 'Não Iniciados' },
        { key: 'in_progress', label: 'Ao Vivo' },
        { key: 'finished', label: 'Terminados' },
    ];

    return (
        <div className="flex-shrink-0 p-1">
            <div className="grid grid-cols-2 gap-2 p-0 bg-white rounded-lg shadow-md">
                {filters.map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={`flex-1 text-center text-sm font-semibold p-1 rounded-md transition-colors whitespace-nowrap ${
                            activeFilter === filter.key
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-blue-800 hover:bg-blue-300'
                        }`}
                    >
                        {filter.label} ({counts[filter.key] || 0})
                    </button>
                ))}
            </div>
        </div>
    );
};

// ### NOVO COMPONENTE PARA MOSTRAR O STATUS DA VERIFICAÇÃO ###
const ScanStatusDisplay = ({ status }: { status: { scanning: boolean, progress: number, total: number } }) => {
    if (!status.scanning || status.total === 0 || status.progress === status.total) {
        return null;
    }
    return (
        <div className="p-2 text-center text-sm text-gray-600 bg-blue-100 rounded-lg shadow-md mx-2">
            <div className="flex items-center justify-center gap-2">
                <LoaderCircle size={16} className="animate-spin" />
                <span>Verificando jogos... ({status.progress} / {status.total})</span>
            </div>
        </div>
    );
};

// ### COMPONENTE ALTERADO: LinhaJogo agora mostra os "selos" ###
const LinhaJogo = ({ game, isSelected, isPinned, onSelectFixture, onPin, matches }: { game: any, isSelected: boolean, isPinned: boolean, onSelectFixture: (id: number) => void, onPin: () => void, matches: string[] }) => {
    const { teams, fixture } = game;
    const handlePinClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onPin();
    };
    return (
        <div onClick={() => onSelectFixture(fixture.id)} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`} >
            <span className="w-14 text-xs text-gray-700 font-semibold">{new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex-1 flex flex-col min-w-0 px-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-black truncate">{teams.home.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-black truncate">{teams.away.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {matches && matches.length > 0 && (
                    <div className="flex flex-col gap-1 items-end">
                        {matches.map(methodName => (
                            <span key={methodName} className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                                {methodName.replace('ENTRADA ', '')}
                            </span>
                        ))}
                    </div>
                )}
                <button onClick={handlePinClick} className="p-2 rounded-full hover:bg-gray-200">
                    <Star size={16} className={`transition-colors ${isPinned ? 'text-amber-500 fill-amber-400' : 'text-gray-400'}`} />
                </button>
            </div>
        </div>
    );
};

// ### COMPONENTE ALTERADO: ColunaJogos agora mostra o status e passa os resultados ###
const ColunaJogos = ({ 
    groupedFixtures, 
    selectedFixtureId, 
    onSelectFixture, 
    pinnedGameIds, 
    onPinGame,
    gameCounts,
    statusFilter,
    onStatusFilterChange,
    scanStatus,
    methodMatches, // <-- Prop recebida
}: any) => {
    return (
        <div className="space-y-3 h-full overflow-y-auto bg-gray-50 p-2 rounded-lg">
            <GameStatusFilters
                counts={gameCounts}
                activeFilter={statusFilter}
                onFilterChange={onStatusFilterChange}
            />
            
            <ScanStatusDisplay status={scanStatus} />

            {groupedFixtures.length > 0 ? (
                groupedFixtures.map(([groupName, groupData]: GameGroup) => (
                    <div key={groupName} className="bg-white rounded-lg shadow-md">
                        <h3 className="text-sm font-bold text-black p-3 border-b flex items-center gap-2">
                            {groupData.games[0]?.league?.logo && (<Image src={groupData.games[0].league.logo} alt={groupName} width={16} height={16} unoptimized/>)}
                            {groupName}
                        </h3>
                        <div className="p-1 space-y-1">
                            {groupData.games.map((game: any) => {
                                // A lógica para pegar os matches agora funciona
                                const matches = methodMatches[game.fixture.id] || [];
                                return (
                                    <LinhaJogo 
                                        key={game.fixture.id}
                                        game={game}
                                        isSelected={selectedFixtureId === game.fixture.id}
                                        onSelectFixture={onSelectFixture}
                                        isPinned={pinnedGameIds.includes(game.fixture.id)}
                                        onPin={() => onPinGame(game.fixture.id)}
                                        matches={matches}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow-md">
                    Nenhum jogo encontrado para os filtros selecionados.
                </div>
            )}
        </div>
    );
};

const ColunaAnalise = ({ selectedFixtureId, allFixtures, analysisCache, loadingFixtureId, pageData, onOpenModal, onGoBack }: any) => {
    // Adicionamos o botão de Voltar que só aparece em telas pequenas (lg:hidden)
    const BackButton = () => (
        <div className="p-4 lg:hidden">
            <button 
                onClick={onGoBack} 
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
                <CornerUpLeft size={16} />
                Voltar para a lista de jogos
            </button>
        </div>
    );

    if (!selectedFixtureId) {
        // No desktop, mostra o painel para selecionar um jogo
        return (
            <div className="hidden lg:flex bg-white rounded-lg shadow-md h-full items-center justify-center text-center p-4 sticky top-6">
                <div>
                    <BrainCircuit size={48} className="mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione um Jogo</h3>
                    <p className="mt-1 text-sm text-gray-500">Clique em uma partida na lista ao lado para ver a análise detalhada.</p>
                </div>
            </div>
        );
    }
    
    const fixtureData = allFixtures.find((f: any) => f.fixture.id === selectedFixtureId);
    const isLoading = loadingFixtureId === selectedFixtureId;
    const currentAnalysisData = analysisCache[selectedFixtureId];

    if (!fixtureData) return null;

    return (
        <div className="bg-white rounded-lg shadow-md sticky top-6 h-full overflow-y-auto">
            <BackButton />
            {isLoading ? (
                <AnalysisPanelSkeleton fixtureData={fixtureData} />
            ) : currentAnalysisData && !currentAnalysisData.error ? (
                <AnalysisPanel
                    fixtureData={fixtureData}
                    analysisData={currentAnalysisData}
                    pageData={pageData}
                    onOpenModal={() => onOpenModal(fixtureData)}
                />
            ) : (
                <div className="text-center text-red-500 p-6">
                    Não foi possível carregar os dados de análise para este jogo.
                </div>
            )}
        </div>
    );
};


// ============================================================================
// COMPONENTE PRINCIPAL (O "CÉREBRO" DA PÁGINA)
// ============================================================================

export default function JogosCliente({ initialData }: { initialData: any }) {
    const [pageData, setPageData] = useState(initialData);
    const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
    const [activeDate, setActiveDate] = useState<'today' | 'tomorrow'>('today');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeague, setSelectedLeague] = useState('all');
    const [groupBy, setGroupBy] = useState<'league' | 'time'>('league');
    const [analysisCache, setAnalysisCache] = useState<Record<number, any>>({});
    const [loadingFixtureId, setLoadingFixtureId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFixtureForModal, setSelectedFixtureForModal] = useState<any | null>(null);
    const [pinnedGameIds, setPinnedGameIds] = useState<number[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'finished'>('all');
    const [mobileView, setMobileView] = useState<'list' | 'analysis'>('list');

    // ### NOVOS ESTADOS ADICIONADOS AQUI ###
    const [methodMatches, setMethodMatches] = useState<Record<string, string[]>>({});
    const [scanStatus, setScanStatus] = useState({ scanning: false, progress: 0, total: 0 });

    useEffect(() => {
        const savedPins = localStorage.getItem('pinnedGameIds');
        if (savedPins) {
            setPinnedGameIds(JSON.parse(savedPins));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('pinnedGameIds', JSON.stringify(pinnedGameIds));
    }, [pinnedGameIds]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/fetch-daily');
                if (!response.ok) return;
                setPageData(await response.json());
            } catch (error) { console.error("Erro na auto-atualização:", error); }
        };
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchAnalysis = async (gameData: any) => {
        const { fixture } = gameData;
        if (analysisCache[fixture.id]) {
            return analysisCache[fixture.id];
        }
        setLoadingFixtureId(fixture.id);
        try {
            const { league, teams } = gameData;
            const params = new URLSearchParams({
                fixtureId: fixture.id.toString(), leagueId: league.id.toString(), homeTeamId: teams.home.id.toString(), awayTeamId: teams.away.id.toString(),
            });
            const response = await fetch(`/api/fixture-analysis?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao buscar análise');
            const data = await response.json();
            setAnalysisCache(prev => ({ ...prev, [fixture.id]: data }));
            return data;
        } catch (error) {
            console.error("Erro ao buscar análise:", error);
            setAnalysisCache(prev => ({ ...prev, [fixture.id]: { error: true } }));
            return { error: true };
        } finally {
            setLoadingFixtureId(null);
        }
    };

    const handlePinGame = (fixtureId: number) => {
        setPinnedGameIds(prevIds => {
            if (prevIds.includes(fixtureId)) {
                return prevIds.filter(id => id !== fixtureId);
            } else {
                return [...prevIds, fixtureId];
            }
        });
    };
    
    const uniqueLeagues = useMemo(() => {
        if (!pageData?.fixtures) return [];
        const leagues = pageData.fixtures.map((game: any) => game.league);
        return [...new Map(leagues.map(item => [item['id'], item])).values()];
    }, [pageData]);

    const baseFilteredGames = useMemo(() => {
        if (!pageData?.fixtures) return [];
        const formatLocalDate = (date: Date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const dateToFilter = activeDate === 'today' ? formatLocalDate(today) : formatLocalDate(tomorrow);
        
        let filtered = pageData.fixtures.filter((f: any) => ALLOWED_LEAGUE_IDS.includes(f.league.id))?.filter((f: any) => {
            const fixtureDateLocal = formatLocalDate(new Date(f.fixture.date));
            return fixtureDateLocal === dateToFilter;
        }) || [];
        
        if (selectedLeague !== 'all') { filtered = filtered.filter((f: any) => f.league.id.toString() === selectedLeague); }
        
        if (searchQuery.length > 2) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter((f: any) => f.teams.home.name.toLowerCase().includes(lowerCaseQuery) || f.teams.away.name.toLowerCase().includes(lowerCaseQuery) || f.league.name.toLowerCase().includes(lowerCaseQuery));
        }
        return filtered;
    }, [pageData, activeDate, searchQuery, selectedLeague]);

    const gameCounts = useMemo(() => {
        if (!baseFilteredGames) return { all: 0, not_started: 0, in_progress: 0, finished: 0 };
        const liveStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'SUSP', 'INT', 'LIVE'];
        const finishedStatuses = ['FT', 'AET', 'PEN'];
        const notStartedStatuses = ['NS', 'TBD', 'PST'];

        return {
            all: baseFilteredGames.length,
            not_started: baseFilteredGames.filter(f => notStartedStatuses.includes(f.fixture.status.short)).length,
            in_progress: baseFilteredGames.filter(f => liveStatuses.includes(f.fixture.status.short)).length,
            finished: baseFilteredGames.filter(f => finishedStatuses.includes(f.fixture.status.short)).length,
        };
    }, [baseFilteredGames]);

    const groupedFixtures = useMemo(() => {
        if (!baseFilteredGames) return [];
        const liveStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'SUSP', 'INT', 'LIVE'];
        const finishedStatuses = ['FT', 'AET', 'PEN'];
        const notStartedStatuses = ['NS', 'TBD', 'PST'];
        
        let statusFilteredGames;
        switch (statusFilter) {
            case 'not_started':
                statusFilteredGames = baseFilteredGames.filter(f => notStartedStatuses.includes(f.fixture.status.short));
                break;
            case 'in_progress':
                statusFilteredGames = baseFilteredGames.filter(f => liveStatuses.includes(f.fixture.status.short));
                break;
            case 'finished':
                statusFilteredGames = baseFilteredGames.filter(f => finishedStatuses.includes(f.fixture.status.short));
                break;
            default:
                statusFilteredGames = baseFilteredGames;
        }

        const groupedByLeague = statusFilteredGames.reduce((acc: any, curr: any) => {
            const leagueName = curr.league.name;
            if (!acc[leagueName]) { acc[leagueName] = { games: [], leagueId: curr.league.id }; }
            acc[leagueName].games.push(curr);
            return acc;
        }, {});

        for (const leagueName in groupedByLeague) {
            groupedByLeague[leagueName].games.sort((a: any, b: any) => {
                const aIsPinned = pinnedGameIds.includes(a.fixture.id);
                const bIsPinned = pinnedGameIds.includes(b.fixture.id);
                if (aIsPinned && !bIsPinned) return -1;
                if (!aIsPinned && bIsPinned) return 1;
                return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
            });
        }

        let processedGroups = Object.entries(groupedByLeague);
        
        if (groupBy === 'time') {
            processedGroups.sort(([, groupA]: any, [, groupB]: any) => {
                const firstGameTimeA = new Date(groupA.games[0].fixture.date).getTime();
                const firstGameTimeB = new Date(groupB.games[0].fixture.date).getTime();
                return firstGameTimeA - firstGameTimeB;
            });
        } else { 
            processedGroups.sort(([, groupA]: any, [, groupB]: any) => {
                const indexA = ALLOWED_LEAGUE_IDS.indexOf(groupA.leagueId);
                const indexB = ALLOWED_LEAGUE_IDS.indexOf(groupB.leagueId);
                return indexA - indexB;
            });
        }
        return processedGroups;
    }, [baseFilteredGames, statusFilter, groupBy, pinnedGameIds]);
    
    const allFixtures = useMemo(() => {
        if (!groupedFixtures) return [];
        // Adicionamos o tipo `GameGroup` para ajudar o TypeScript
        return groupedFixtures.flatMap((group: GameGroup) => group[1].games);
    }, [groupedFixtures]);

    // ============================================================================
    // NOVA FUNÇÃO DE VERIFICAÇÃO SILENCIOSA
    // ============================================================================
    useEffect(() => {
        let isCancelled = false;
        
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
        const runSilentVerification = async () => {
            setScanStatus({ scanning: true, progress: 0, total: allFixtures.length });
    
            let progressCount = 0;
            for (const game of allFixtures) {
                if (isCancelled) break;
    
                const fixtureId = game.fixture.id;
                
                // Pula a busca se os dados já foram buscados e verificados nesta sessão
                if (methodMatches[fixtureId] || analysisCache[fixtureId]) {
                     progressCount++;
                     setScanStatus(prev => ({ ...prev, progress: progressCount }));
                     
                     // Garante que a verificação seja executada se os dados estão no cache mas ainda não foram verificados
                     if (analysisCache[fixtureId] && !methodMatches[fixtureId]) {
                         const matches = verificarMetodos(analysisCache[fixtureId]);
                         if (matches.length > 0) {
                             setMethodMatches(prev => ({ ...prev, [fixtureId]: matches }));
                         }
                     }
                     continue; 
                }
    
                // fetchAnalysis é inteligente e usa o cache, então podemos apenas chamá-lo.
                const analysisData = await fetchAnalysis(game);
    
                if (isCancelled) break;
    
                // Verifica os métodos se os dados forem válidos
                if (analysisData && !analysisData.error) {
                    const matches = verificarMetodos(analysisData);
                    if (matches.length > 0) {
                        // Atualiza o estado imediatamente para mostrar o "selo"
                        setMethodMatches(prev => ({ ...prev, [fixtureId]: matches }));
                    }
                }
                
                // Atualiza o progresso após cada jogo ser processado
                progressCount++;
                setScanStatus(prev => ({ ...prev, progress: progressCount }));
    
                // A pausa para evitar o erro 429
                await delay(1500); // 1.5 segundos
            }
    
            if (!isCancelled) {
                 setScanStatus(prev => ({ ...prev, scanning: false }));
            }
        };
    
        // Inicia o processo apenas se houver jogos na lista
        if (allFixtures.length > 0) {
            runSilentVerification();
        }
    
        // Função de limpeza para parar o loop se as dependências mudarem
        return () => {
            isCancelled = true;
        };
    }, [allFixtures]); // Dependência chave: re-executa quando a lista de jogos muda


    const handleSelectFixture = (fixtureId: number) => {
        const gameData = allFixtures.find(g => g.fixture.id === fixtureId);
        if (gameData) {
            setSelectedFixtureId(fixtureId);
            fetchAnalysis(gameData);
            setMobileView('analysis'); // Muda para a tela de análise no celular
        }
    };

    const handleGoBackToList = () => {
        setMobileView('list');
        setSelectedFixtureId(null); // Limpa a seleção para o desktop se a tela for redimensionada
    };

    const handleOpenAnalysisModal = (gameData: any) => {
        setSelectedFixtureForModal(gameData);
        setIsModalOpen(true);
    };

    return (
        <>
            {(!pageData || !pageData.fixtures) ? (
                <div className="text-center text-amber-500 p-8">Falha ao carregar dados iniciais ou sem jogos para hoje.</div>
            ) : (
                <>
                    <div className="hidden lg:grid lg:grid-cols-[260px_1fr_3fr] gap-2 h-full">
                        <ColunaFiltros
                            activeDate={activeDate}
                            setActiveDate={setActiveDate}
                            selectedLeague={selectedLeague}
                            setSelectedLeague={setSelectedLeague}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            uniqueLeagues={uniqueLeagues}
                            groupBy={groupBy}
                            setGroupBy={setGroupBy}
                        />
                        
                        <ColunaJogos
                            groupedFixtures={groupedFixtures}
                            selectedFixtureId={selectedFixtureId}
                            onSelectFixture={handleSelectFixture}
                            pinnedGameIds={pinnedGameIds}
                            onPinGame={handlePinGame}
                            gameCounts={gameCounts}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            scanStatus={scanStatus}
                            methodMatches={methodMatches}
                        />

                        <ColunaAnalise
                            selectedFixtureId={selectedFixtureId}
                            allFixtures={allFixtures}
                            analysisCache={analysisCache}
                            loadingFixtureId={loadingFixtureId}
                            pageData={pageData}
                            onOpenModal={handleOpenAnalysisModal}
                            onGoBack={handleGoBackToList}
                        />
                    </div>

                    <div className="lg:hidden h-full">
                        {mobileView === 'list' ? (
                            <div className="flex flex-col h-full gap-4 p-2">
                                <ColunaFiltros
                                    activeDate={activeDate}
                                    setActiveDate={setActiveDate}
                                    selectedLeague={selectedLeague}
                                    setSelectedLeague={setSelectedLeague}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    uniqueLeagues={uniqueLeagues}
                                    groupBy={groupBy}
                                    setGroupBy={setGroupBy}
                                />
                                <ColunaJogos
                                    groupedFixtures={groupedFixtures}
                                    selectedFixtureId={selectedFixtureId}
                                    onSelectFixture={handleSelectFixture}
                                    pinnedGameIds={pinnedGameIds}
                                    onPinGame={handlePinGame}
                                    gameCounts={gameCounts}
                                    statusFilter={statusFilter}
                                    onStatusFilterChange={setStatusFilter}
                                    scanStatus={scanStatus}
                                    methodMatches={methodMatches}
                                />
                            </div>
                        ) : (
                            <ColunaAnalise
                                selectedFixtureId={selectedFixtureId}
                                allFixtures={allFixtures}
                                analysisCache={analysisCache}
                                loadingFixtureId={loadingFixtureId}
                                pageData={pageData}
                                onOpenModal={handleOpenAnalysisModal}
                                onGoBack={handleGoBackToList}
                            />
                        )}
                    </div>

                    {isModalOpen && selectedFixtureForModal && analysisCache[selectedFixtureForModal.fixture.id] && (
                        <AiAnalysisModal
                            fixtureData={selectedFixtureForModal}
                            analysisData={analysisCache[selectedFixtureForModal.fixture.id]}
                            pageData={pageData}
                            onClose={() => setIsModalOpen(false)}
                        />
                    )}
                </>
            )}
        </>
    );
}