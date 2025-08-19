'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Clock, Flag, Star, Search, ChevronLeft, ChevronRight, BrainCircuit, ShieldCheck, Zap, Target, Shield, AlertCircle, Gauge, ArrowLeftRight, Home, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { DominanceBar } from './DominanceBar';
import { GameTimelineChart } from './GameTimelineChart';

const ALLOWED_LEAGUE_IDS = [
    2, 3, 4, 5, 7, 9, 13, 14, 15, 11, 20, 21, 22, 24, 27, 31, 32, 37, 39, 40, 41, 42, 43, 45, 47, 48, 49, 50, 51, 66, 72, 73, 79, 84, 92, 96, 97, 98, 101, 102, 103, 106, 107, 108, 109, 114, 119, 120, 122, 123, 124, 125, 126, 128, 129, 130, 131, 136, 137, 140, 141, 163, 173, 174, 175, 176, 177, 178, 179, 182, 181, 184, 185, 135, 136, 203, 204, 212, 219, 220, 229, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 255, 256, 257, 262, 264, 271, 272, 282, 283, 281, 284, 285, 286, 292, 293, 294, 295, 304, 328, 329, 334, 345, 346, 347, 358, 366, 367, 392, 489, 78, 473, 474, 491, 501, 503, 523, 527, 531, 550, 558, 559, 633, 638, 497, 519, 529, 555, 556, 557, 592, 593, 548, 657, 702, 713, 722, 727, 760, 770, 772, 803, 807, 810, 4330, 4395, 4888, 4400, 79, 61, 62, 94, 88, 71, 72, 144, 147, 253, 113, 207, 208, 307, 203, 218, 15, 1, 2146, 2154
];


// NOVO COMPONENTE SKELETON - Para o estado de carregamento
const StatsSkeleton = () => (
    <div className="space-y-1.5 p-1 animate-pulse">
        {[...Array(7)].map((_, i) => (
            <div key={i} className="flex justify-between items-center w-full">
                <div className="h-7 w-12 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-28 bg-gray-300 rounded-md"></div>
                <div className="h-7 w-12 bg-gray-300 rounded-md"></div>
            </div>
        ))}
    </div>
);


// --- Componente para a Tabela de Estatísticas Detalhada ---
const DetailedStats = ({ game, events }: { game: any, events: any[] }) => {

    const homeTeamId = game.teams.home.id;

    const substitutions = useMemo(() => {
        let home = 0;
        let away = 0;
        if (events && events.length > 0) {
            events.forEach(event => {
                if (event.type === 'subst') {
                    if (event.team.id === homeTeamId) { home++; } 
                    else { away++; }
                }
            });
        }
        return { home, away };
    }, [events, homeTeamId]);

    const awayTeamId = game.teams.away.id;

    const calculatePressure = (teamId: number) => {
        if (!events) return 0;
        return events.reduce((score, event) => {
            if (event.team.id !== teamId) return score;
            const weights = { 'Goal': 5, 'Shot on Goal': 3, 'Dangerous Attack': 2, 'Attack': 1, 'Corner': 1 };
            return score + (weights[event.type] || 0);
        }, 0);
    };

    const homePressure = calculatePressure(homeTeamId);
    const awayPressure = calculatePressure(awayTeamId);

    const getStat = (type: string) => {
        const homeStats = game.statistics.find((s: any) => s.team.id === homeTeamId)?.statistics;
        const awayStats = game.statistics.find((s: any) => s.team.id === awayTeamId)?.statistics;
        const homeStat = homeStats?.find((stat: any) => stat.type === type)?.value ?? 0;
        const awayStat = awayStats?.find((stat: any) => stat.type === type)?.value ?? 0;
        const parseValue = (val: any) => {
            if (typeof val === 'string' && val.includes('%')) { return parseFloat(val.replace('%', '')); }
            return Number(val);
        };
        return { home: parseValue(homeStat), away: parseValue(awayStat) };
    };
    
    // LISTA DE STATS ATUALIZADA - Sem "Ataques Perigosos"
    const statsList = [
        { label: 'Chutes no Gol', type: 'Shots on Goal', icon: <Target size={14} className="text-gray-500" /> },
        { label: 'Total de Chutes', type: 'Total Shots', icon: <Zap size={14} className="text-gray-500" /> },
        { label: 'Escanteios', type: 'Corner Kicks', icon: <Flag size={14} className="text-gray-500" /> },
        { label: 'Faltas', type: 'Fouls', icon: <Shield size={14} className="text-gray-500" /> },
        { label: 'Posse de Bola', type: 'Ball Possession', icon: <Shield size={14} className="text-gray-500" /> },
        { label: 'Substituições', type: 'CustomSubstitutions', icon: <ArrowLeftRight size={14} className="text-gray-700" /> },
        { label: 'Impedimentos', type: 'Offsides', icon: <AlertCircle size={14} className="text-gray-500" /> },
        { label: 'Defesas do Goleiro', type: 'Goalkeeper Saves', icon: <Shield size={14} className="text-gray-500" /> },
        { label: 'Chutes Bloqueados', type: 'Blocked Shots', icon: <Zap size={14} className="text-gray-500" /> },
    ];

    const yellowCards = getStat('Yellow Cards');
    const redCards = getStat('Red Cards');

    return (
        <div className="space-y-1.5 p-1">
            <div className="flex justify-between items-center w-full text-xs">
                <span className={`px-3 py-1.5 rounded-md min-w-[45px] text-center shadow-inner bg-gray-300 text-gray-800 font-bold`}>{homePressure}</span>
                <span className="text-gray-500 font-semibold px-2 text-center flex items-center gap-1.5"><Gauge size={14} /> Pressão</span>
                <span className={`px-3 py-1.5 rounded-md min-w-[45px] text-center shadow-inner bg-gray-300 text-gray-800 font-bold`}>{awayPressure}</span>
            </div>

            {statsList.map(stat => {
                const homeValue = stat.type === 'CustomSubstitutions' ? substitutions.home : getStat(stat.type).home;
                const awayValue = stat.type === 'CustomSubstitutions' ? substitutions.away : getStat(stat.type).away;
                const homeBgClass = Number(homeValue) > Number(awayValue) ? "bg-amber-400 font-bold text-gray-900" : "bg-gray-300 text-gray-800";
                const awayBgClass = Number(awayValue) > Number(homeValue) ? "bg-amber-400 font-bold text-gray-900" : "bg-gray-300 text-gray-800";
                
                return (
                    <div key={stat.type} className="flex justify-between items-center w-full text-xs">
                        <span className={`px-3 py-1.5 rounded-md min-w-[45px] text-center shadow-inner ${homeBgClass}`}>{homeValue}</span>
                        <span className="text-gray-500 font-semibold px-2 text-center">{stat.label}</span>
                        <span className={`px-3 py-1.5 rounded-md min-w-[45px] text-center shadow-inner ${awayBgClass}`}>{awayValue}</span>
                    </div>
                );
            })}
            
            <div className="flex justify-between items-center w-full text-xs pt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-4 bg-yellow-400 rounded-sm"></div>
                    <span className="font-bold text-gray-800">{yellowCards.home}</span>
                    <div className="w-2.5 h-4 bg-red-600 rounded-sm ml-1"></div>
                    <span className="font-bold text-gray-800">{redCards.home}</span>
                </div>
                <span className="text-gray-500 font-semibold">Cartões</span>
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-800">{yellowCards.away}</span>
                    <div className="w-2.5 h-4 bg-yellow-400 rounded-sm"></div>
                    <span className="font-bold text-gray-800">{redCards.away}</span>
                    <div className="w-2.5 h-4 bg-red-600 rounded-sm ml-1"></div>
                </div>
            </div>
        </div>
    );
};


// --- Componente Card de Jogo ---
const LiveGameCard = ({ game, isPinned, onPin }: { game: any, isPinned: boolean, onPin: () => void }) => {

    const getStat = (type: string) => {
        const homeTeamStats = game.statistics.find((s: any) => s.team.id === game.teams.home.id)?.statistics;
        const awayTeamStats = game.statistics.find((s: any) => s.team.id === game.teams.away.id)?.statistics;
        const homeStat = homeTeamStats?.find((stat: any) => stat.type === type)?.value ?? 0;
        const awayStat = awayTeamStats?.find((stat: any) => stat.type === type)?.value ?? 0;

        if (typeof homeStat === 'string' && homeStat.includes('%')) {
            return { home: parseFloat(homeStat.replace('%', '')), away: parseFloat(awayStat.replace('%', '')) };
        }
        return { home: Number(homeStat), away: Number(awayStat) };
    };

    const getGameConditions = (game: any) => {
        const homeDanger = getStat('Dangerous Attacks').home;
        const awayDanger = getStat('Dangerous Attacks').away;
        const homeShots = getStat('Shots on Goal').home;
        const awayShots = getStat('Shots on Goal').away;
        const homeCorners = getStat('Corner Kicks').home;
        const awayCorners = getStat('Corner Kicks').away;
        const homePossession = getStat('Ball Possession').home;
        const awayPossession = getStat('Ball Possession').away;
        const homeFouls = getStat('Fouls').home;
        const awayFouls = getStat('Fouls').away;
        const homeYellow = getStat('Yellow Cards').home;
        const awayYellow = getStat('Yellow Cards').away;
        const homeRed = getStat('Red Cards').home;
        const awayRed = getStat('Red Cards').away;
        const homeGoals = game.goals.home;
        const awayGoals = game.goals.away;

        let conditions: string[] = [];

        if (homePossession > 60) {
            conditions.push(`Time da casa domina a posse de bola (${homePossession}%).`);
        } else if (awayPossession > 60) {
            conditions.push(`Time visitante domina a posse de bola (${awayPossession}%).`);
        } else {
            conditions.push(`Posse de bola equilibrada.`);
        }

        if (homeDanger > awayDanger) {
            conditions.push(`Mais ataques perigosos para a casa.`);
        } else if (awayDanger > homeDanger) {
            conditions.push(`Mais ataques perigosos para o visitante.`);
        } else {
            conditions.push(`Ataques perigosos equilibrados.`);
        }

        if (homeShots > awayShots) {
            conditions.push(`Casa finalizou mais a gol.`);
        } else if (awayShots > homeShots) {
            conditions.push(`Visitante finalizou mais a gol.`);
        } else {
            conditions.push(`Finalizações equilibradas.`);
        }

        if (homeCorners > awayCorners) {
            conditions.push(`Casa tem mais escanteios.`);
        } else if (awayCorners > homeCorners) {
            conditions.push(`Visitante tem mais escanteios.`);
        } else {
            conditions.push(`Escanteios equilibrados.`);
        }

        if (homeYellow > awayYellow) {
            conditions.push(`Mais cartões amarelos para a casa.`);
        } else if (awayYellow > homeYellow) {
            conditions.push(`Mais cartões amarelos para o visitante.`);
        }

        if (homeRed > awayRed) {
            conditions.push(`Casa com mais cartões vermelhos.`);
        } else if (awayRed > homeRed) {
            conditions.push(`Visitante com mais cartões vermelhos.`);
        }

        if (homeFouls > awayFouls) {
            conditions.push(`Casa com mais faltas.`);
        } else if (awayFouls > homeFouls) {
            conditions.push(`Visitante com mais faltas.`);
        }

        if (homeGoals > awayGoals) {
            conditions.push(`Casa vencendo por ${homeGoals} a ${awayGoals}.`);
        } else if (awayGoals > homeGoals) {
            conditions.push(`Visitante vencendo por ${awayGoals} a ${homeGoals}.`);
        } else {
            conditions.push(`Placar empatado em ${homeGoals} a ${awayGoals}.`);
        }

        if (homeDanger > awayDanger && homePossession > 55) {
            conditions.push(`Sugestão: Back na equipe da casa devido ao domínio ofensivo.`);
        } else if (awayDanger > homeDanger && awayPossession > 55) {
            conditions.push(`Sugestão: Back na equipe visitante por superioridade ofensiva.`);
        } else if (homeGoals === awayGoals && (homeShots + awayShots) > 15) {
            conditions.push(`Sugestão: jogo aberto com chances para ambos os lados, Over 2.5 gols.`);
        } else {
            conditions.push(`Jogo equilibrado, sem indicação clara.`);
        }

        return conditions.join(' ');
    };

    const getMomentumSignal = () => {
        const events = game.events || [];
        const homeId = game.teams.home.id;
        const currentMinute = game.fixture.status.elapsed;
        let recentHomeEvents = 0;
        let recentAwayEvents = 0;

        for (let i = currentMinute - 5; i <= currentMinute; i++) {
            events.forEach(event => {
                if (event.time.elapsed === i && ['Dangerous Attack', 'Shot on Goal', 'Goal'].includes(event.type)) {
                    if (event.team.id === homeId) recentHomeEvents++;
                    else recentAwayEvents++;
                }
            });
        }
        const totalGoals = game.goals.home + game.goals.away;
        if (recentHomeEvents >= 6 && totalGoals === 0) {
            return `⚠️ Pressão forte da casa sem gol recente. Over 0.5 pode ser considerado.`;
        } else if (recentAwayEvents >= 6 && totalGoals === 0) {
            return `⚠️ Pressão forte do visitante sem gol recente. Over 0.5 pode ser considerado.`;
        } else if (recentHomeEvents >= 6) {
            return `🔥 Casa pressionando muito nos últimos 5 minutos.`;
        } else if (recentAwayEvents >= 6) {
            return `🔥 Visitante pressionando muito nos últimos 5 minutos.`;
        }
        return null;
    };


    const calculatePressure = (teamId: number) => {
        if (!game.events) return 0;
        return game.events.reduce((score, event) => {
            if (event.team.id !== teamId) return score;
            const weights = { 'Goal': 5, 'Shot on Goal': 3, 'Dangerous Attack': 2, 'Attack': 1, 'Corner': 1 };
            return score + (weights[event.type] || 0);
        }, 0);
    };

    const generateBettingAlerts = () => {
        if (!game.statistics || game.statistics.length === 0) return null;
        const stats = {
            homeShotsOnGoal: getStat('Shots on Goal').home,
            awayShotsOnGoal: getStat('Shots on Goal').away,
            homeTotalShots: getStat('Total Shots').home,
            awayTotalShots: getStat('Total Shots').away,
            homeBlockedShots: getStat('Blocked Shots').home,
            awayBlockedShots: getStat('Blocked Shots').away,
            homeCorners: getStat('Corner Kicks').home,
            awayCorners: getStat('Corner Kicks').away,
            homePossession: getStat('Ball Possession').home,
            awayPossession: getStat('Ball Possession').away,
            homeGoalkeeperSaves: getStat('Goalkeeper Saves').home,
            awayGoalkeeperSaves: getStat('Goalkeeper Saves').away,
            homePressure: calculatePressure(game.teams.home.id),
            awayPressure: calculatePressure(game.teams.away.id),
        };
        const homeIPO = (stats.homeShotsOnGoal * 3) + (stats.homeCorners * 1.5) + (stats.homeTotalShots * 1);
        const awayIPO = (stats.awayShotsOnGoal * 3) + (stats.awayCorners * 1.5) + (stats.awayTotalShots * 1);
        const elapsed = game.fixture.status.elapsed;
        const totalGoals = game.goals.home + game.goals.away;

        const homeDominanceScore = (stats.homeShotsOnGoal * 2) + (stats.homeCorners * 1.5) + stats.homeTotalShots;
        const awayDominanceScore = (stats.awayShotsOnGoal * 2) + (stats.awayCorners * 1.5) + stats.awayTotalShots;
        const totalDominance = homeDominanceScore + awayDominanceScore;

        const homeDominancePercentage = totalDominance > 0 ? (homeDominanceScore / totalDominance) * 100 : 50;
        const awayDominancePercentage = totalDominance > 0 ? (awayDominanceScore / totalDominance) * 100 : 50;


        if (
            elapsed >= 10 && elapsed <= 60 && 
            game.goals.home === game.goals.away && 
            homeIPO > (awayIPO * 1.5) && 
            stats.homeTotalShots > (stats.awayTotalShots * 2) && 
            stats.homeShotsOnGoal >= 4 && 
            stats.homeCorners > (stats.awayCorners + 2) 
        ) {
            return {
                type: 'Back Casa (Domínio total)',
                text: `Jogo empatado, mas a casa domina completamente as ações ofensivas.`,
                color: 'green'
            };
        }

        if (
            elapsed < 25 &&
            stats.homeTotalShots === 4 &&
            stats.homeShotsOnGoal >= 2 &&
            stats.awayShotsOnGoal === 2 &&
            homeDominancePercentage > 55 &&
            awayDominancePercentage < 45
        ) {
            return {
                type: 'Entrada Over 0.5 HT',
                text: `Pressão casa e domínio de ${homeDominancePercentage.toFixed(0)}%, enquanto visitante tem 0 chutes no gol.`,
                color: 'green'
            };
        }
        
        if (
            elapsed < 25 &&
            stats.homeShotsOnGoal >= 2 &&
            stats.awayShotsOnGoal === 0 &&
            homeDominancePercentage > 65 &&
            awayDominancePercentage < 35
        ) {
            return {
                type: 'Entrada Lay 0x1 FT - casa com pressão forte',
                text: `Pressão casa e domínio de ${homeDominancePercentage.toFixed(0)}%, enquanto visitante tem 0 chutes no gol.`,
                color: 'green'
            };
        }

        if (
            elapsed > 15 && elapsed <= 30 &&
            (stats.homeTotalShots + stats.awayTotalShots) >= 14 && 
            ((stats.homeShotsOnGoal >= 3 && stats.awayShotsOnGoal >= 2) || (stats.homeShotsOnGoal >= 2 && stats.awayShotsOnGoal >= 3)) && 
            (stats.homePossession > 35 && stats.awayPossession > 35) 
        ) {
            return {
                type: 'Over 2.5 FT (Jogo Aberto)',
                text: 'Partida com alto volume de chutes e chances para ambos os lados. Tendência de gols.',
                color: 'blue'
            };
        }

        if (
            elapsed >= 10 && elapsed <= 30 && 
            totalGoals <= 0 && 
            (stats.homeTotalShots + stats.awayTotalShots) >= 8 && 
            (stats.homeShotsOnGoal + stats.awayShotsOnGoal) >= 2 && 
            stats.homeCorners >= 2 && stats.awayCorners >= 1 && 
            (homeIPO + awayIPO) > 40 
        ) {
            return {
                type: 'Over 1.5 FT (Jogo Aberto)',
                text: 'Ambas as equipes estão finalizando e criando chances. Alta probabilidade de mais gols.',
                color: 'blue'
            };
        }

        if (
            elapsed >= 1 && elapsed <= 20 && 
            totalGoals === 0 && 
            (stats.homeShotsOnGoal >= 1 && stats.awayShotsOnGoal >= 1) && 
            (stats.homeTotalShots + stats.awayTotalShots) >= 5 && 
            (homeIPO + awayIPO) > 20 
        ) {
            return {
                type: 'Ambas Marcam (Jogo Aberto)',
                text: 'Jogo 0x0, mas com os dois times finalizando e criando chances. Tendência para gols de ambos os lados.',
                color: 'blue'
            };
        }

        if (
            elapsed > 15 && elapsed < 60 && 
            game.goals.home === game.goals.away && 
            stats.homePossession > 55 && 
            stats.awayTotalShots > stats.homeTotalShots && 
            stats.awayShotsOnGoal > stats.homeShotsOnGoal && 
            awayIPO > homeIPO 
        ) {
            return {
                type: 'Lay Casa (Visitante vistante jogando melhor)',
                text: 'Casa com posse de bola improdutiva. Visitante cria as melhores chances.',
                color: 'red'
            };
        }

        return null;
    };

    const hasStats = game.statistics && game.statistics.length > 0 && game.statistics.some((s:any) => s.statistics.length > 0);
    const customAlert = hasStats ? generateBettingAlerts() : null;
    const momentumSignalText = hasStats ? getMomentumSignal() : null;
    const analysisText = hasStats ? getGameConditions(game) : "Aguardando dados da partida para gerar análise.";

    return (
        <div className={`bg-white text-gray-800 rounded-xl p-3 flex flex-col space-y-3 shadow-lg border-2 ${isPinned ? 'border-amber-400 shadow-amber-200/50' : 'border-gray-200'}`}>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5 truncate">
                    <Image src={game.league.logo} alt={game.league.name} width={14} height={14} /> 
                    <span className="truncate text-gray-700 text-sm font-semibold">{game.league.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onPin} title="Fixar/Desafixar Jogo">
                        <Star className={`w-5 h-5 transition-colors ${isPinned ? 'fill-amber-400 text-amber-500' : 'text-gray-400 hover:text-amber-400'}`} />
                    </button>
                    <span className="font-mono font-bold text-red-500 animate-pulse bg-red-100 px-2 py-1 rounded-md text-sm">{game.fixture.status.elapsed}&apos;</span>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                    <Image src={game.teams.home.logo} alt={game.teams.home.name} width={32} height={32} className="mx-auto mb-1" />
                    <p className="font-bold text-sm text-gray-800 truncate">{game.teams.home.name}</p>
                </div>
                <div className="text-3xl font-bold text-gray-900 px-2">{game.goals.home} - {game.goals.away}</div>
                <div className="flex-1 text-center">
                    <Image src={game.teams.away.logo} alt={game.teams.away.name} width={32} height={32} className="mx-auto mb-1" />
                    <p className="font-bold text-sm text-gray-800 truncate">{game.teams.away.name}</p>
                </div>
            </div>

            {hasStats && <DominanceBar game={game} />}
            <GameTimelineChart game={game} />

            <div className="flex items-center gap-2 pt-1">
                <a href={`https://www.fulltbet.bet.br/buscar?query=${encodeURIComponent(game.teams.home.name + ' vs ' + game.teams.away.name)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-amber-500 text-white text-xs font-bold py-2.5 rounded-md shadow-md hover:bg-amber-600 transition tracking-wider">
                    ‹FULLTBET›
                </a>
                <a href="https://fulltbet.bet.br/tradeball/liveTradingFeed" target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-gray-800 text-white text-xs font-bold py-2.5 rounded-md shadow-md hover:bg-gray-900 transition tracking-wider">
                    ‹TRADEBALL›
                </a>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg flex flex-col gap-1 text-xs text-blue-800">
                <BrainCircuit className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p><span className="font-bold">Análise do Jogo:</span></p>
                <p>{analysisText}</p>
            </div>

            {hasStats && momentumSignalText && (
                <div className="bg-yellow-50 border border-yellow-300 p-2 rounded-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-xs text-yellow-800"><span className="font-bold">Alerta de Entrada:</span> {momentumSignalText}</p>
                </div>
            )}
            {hasStats && customAlert && (
                <div className={`border p-2 rounded-lg flex items-center gap-2 bg-${customAlert.color}-50 border-${customAlert.color}-200`}>
                    <Zap className={`w-5 h-5 text-${customAlert.color}-500 flex-shrink-0`} />
                    <div className="text-xs">
                        <p className={`font-bold text-${customAlert.color}-800`}>Alerta: {customAlert.type}</p>
                        <p className={`text-${customAlert.color}-700`}>{customAlert.text}</p>
                    </div>
                </div>
            )}
            
            <div className="bg-gray-100 p-1.5 rounded-lg border border-gray-200 min-h-[220px]">
                {hasStats ? <DetailedStats game={game} events={game.events} /> : <StatsSkeleton />}
            </div>
        </div>
    );
};


// --- Componente Principal ---
export default function ScannerCliente({ initialData }: { initialData: any }) {
    // CORREÇÃO 1: O estado inicial AGORA é filtrado
    const [liveGames, setLiveGames] = useState(() => {
        if (!initialData?.liveGames) return [];
        return initialData.liveGames.filter(game => ALLOWED_LEAGUE_IDS.includes(game.league.id));
    });

    const [selectedLeague, setSelectedLeague] = useState('all');
    const [pinnedGameIds, setPinnedGameIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 20;

    useEffect(() => {
        const fetchLiveGames = async () => {
            try {
                const response = await fetch('/api/live-scanner');
                if (!response.ok) return;
                const data = await response.json();

                // CORREÇÃO 2: O filtro também é aplicado nas atualizações
                const filteredGames = data.liveGames.filter(game => ALLOWED_LEAGUE_IDS.includes(game.league.id));
                
                setLiveGames(filteredGames || []);
            } catch (error) { console.error("Falha ao atualizar jogos ao vivo:", error); }
        };
        const intervalId = setInterval(fetchLiveGames, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const uniqueLeagues = useMemo(() => {
        const leagues = liveGames.map((game: any) => game.league);
        return [...new Map(leagues.map(item => [item['id'], item])).values()];
    }, [liveGames]);

    const sortedAndFilteredGames = useMemo(() => {
        let games = liveGames;
        games = games.filter(game => game.statistics && game.statistics.length > 0 && game.statistics.some(s => s.statistics.length > 0));
        if (selectedLeague !== 'all') {
            games = games.filter((game: any) => game.league.id.toString() === selectedLeague);
        }
        if (searchQuery.length > 2) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            games = games.filter((game: any) =>
                game.teams.home.name.toLowerCase().includes(lowerCaseQuery) ||
                game.teams.away.name.toLowerCase().includes(lowerCaseQuery)
            );
        }
        games.sort((a, b) => {
            const aIsPinned = pinnedGameIds.includes(a.fixture.id);
            const bIsPinned = pinnedGameIds.includes(b.fixture.id);
            if (aIsPinned && !bIsPinned) return -1;
            if (!aIsPinned && bIsPinned) return 1;
            const aHasStats = a.statistics && a.statistics.length > 0;
            const bHasStats = b.statistics && b.statistics.length > 0;
            if (aHasStats && !bHasStats) return -1;
            if (!aHasStats && bHasStats) return 1;
            return a.fixture.status.elapsed - b.fixture.status.elapsed;
        });
        return games;
    }, [liveGames, selectedLeague, pinnedGameIds, searchQuery]);

    const handlePinGame = (fixtureId: number) => {
        setPinnedGameIds(prevIds => {
            if (prevIds.includes(fixtureId)) {
                return prevIds.filter(id => id !== fixtureId);
            } else {
                return [...prevIds, fixtureId];
            }
        });
    }

    const totalPages = Math.ceil(sortedAndFilteredGames.length / gamesPerPage);
    const paginatedGames = sortedAndFilteredGames.slice(
        (currentPage - 1) * gamesPerPage,
        currentPage * gamesPerPage
    );

    if (liveGames.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-lg shadow-md">
                <Clock className="w-12 h-12 text-blue-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">Nenhum jogo ao vivo nos campeonatos selecionados.</h2>
                <p className="text-gray-500 mt-2">A página irá atualizar automaticamente quando uma partida começar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-start gap-6">
                <Link href="/">
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">
                        <Home size={18} /> Ir para a Página Principal
                    </button>
                </Link>
                <Link href="/jogos-do-dia">
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">
                        <BookOpen size={18} /> Análise de jogos
                    </button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-md">
                <div>
                    <label htmlFor="league-filter" className="text-sm font-medium text-gray-700">Filtrar por Campeonato:</label>
                    <select id="league-filter" value={selectedLeague} onChange={(e) => { setSelectedLeague(e.target.value); setCurrentPage(1); }} className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                        <option value="all">Todos os Campeonatos</option>
                        {uniqueLeagues.map((league: any) => (<option key={league.id} value={league.id}>{league.name} - {league.country}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="team-search" className="text-sm font-medium text-gray-700">Buscar por Time:</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="w-5 h-5 text-gray-500" /></div>
                        <input type="text" id="team-search" onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" placeholder="Nome do time..." />
                    </div>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 p-2 bg-white rounded-lg shadow-md">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><ChevronLeft /></button>
                    <span className="text-sm font-medium text-gray-700">Página {currentPage} de {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50"><ChevronRight /></button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedGames.map((game: any) => (
                    <LiveGameCard
                        key={game.fixture.id}
                        game={game}
                        isPinned={pinnedGameIds.includes(game.fixture.id)}
                        onPin={() => handlePinGame(game.fixture.id)}
                    />
                ))}
            </div>
        </div>
    );
}