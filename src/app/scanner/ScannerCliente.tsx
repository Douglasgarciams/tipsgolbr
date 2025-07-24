'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Clock, Flag, Star, Search, ChevronLeft, ChevronRight, BrainCircuit, ShieldCheck, Zap, Target, Shield, AlertCircle, Gauge, ArrowLeftRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { DominanceBar } from './DominanceBar';
import { GameTimelineChart } from './GameTimelineChart';

// --- Componente para a Tabela de Estatísticas Detalhada ---
const DetailedStats = ({ game, events }: { game: any, events: any[] }) => {

  const homeTeamId = game.teams.home.id;
  
  // --- NOVA LÓGICA PARA CONTAR SUBSTITUIÇÕES ---
  const substitutions = useMemo(() => {
    let home = 0;
    let away = 0;
    if (events && events.length > 0) {
      events.forEach(event => {
        if (event.type === 'subst') { // Procura pelo evento de substituição
          if (event.team.id === homeTeamId) {
            home++;
          } else {
            away++;
          }
        }
      });
    }
    return { home, away };
  }, [events, homeTeamId]);

  if (!game.statistics || game.statistics.length === 0) {
    return (
      <div className="text-center text-xs text-gray-500 py-10">
        <p>Aguardando estatísticas...</p>
      </div>
    );
  }

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
      if (typeof val === 'string' && val.includes('%')) {
        return parseFloat(val.replace('%', ''));
      }
      return Number(val);
    };
    return { home: parseValue(homeStat), away: parseValue(awayStat) };
  };



  const statsList = [
    { label: 'Chutes no Gol', type: 'Shots on Goal', icon: <Target size={14} className="text-gray-500" /> },
    { label: 'Total de Chutes', type: 'Total Shots', icon: <Zap size={14} className="text-gray-500" /> },
    { label: 'Ataques Perigosos', type: 'Dangerous Attacks', icon: <ShieldCheck size={14} className="text-gray-500" /> },
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
    <div className="space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-800 text-[10px]">{homePressure}</span>
        <span className="flex items-center gap-1.5 text-gray-600 text-[10px]">
          <Gauge size={14} className="text-gray-500" /> Pressão
        </span>
        <span className="font-bold text-gray-800 text-[11px]">{awayPressure}</span>
      </div>
      {statsList.map(stat => {
        // Lógica para decidir qual valor mostrar
        const homeValue = stat.type === 'CustomSubstitutions' ? substitutions.home : getStat(stat.type).home;
        const awayValue = stat.type === 'CustomSubstitutions' ? substitutions.away : getStat(stat.type).away;

        return (
          <div key={stat.type} className="flex justify-between items-center">
            <span className="font-bold text-gray-800 text-[10px]">{homeValue}</span>
            <span className="flex items-center gap-1.5 text-gray-600 text-[10px]">{stat.icon} {stat.label}</span>
            <span className="font-bold text-gray-800 text-[11px]">{awayValue}</span>
          </div>
        );
      })}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"></div><span className="font-bold">{yellowCards.home}</span>
          <div className="w-2.5 h-3.5 bg-red-600 rounded-sm ml-1"></div><span className="font-bold">{redCards.home}</span>
        </div>
        <span className="text-gray-600">Cartões</span>
        <div className="flex items-center gap-1">
          <span className="font-bold">{yellowCards.away}</span><div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"></div>
          <span className="font-bold">{redCards.away}</span><div className="w-2.5 h-3.5 bg-red-600 rounded-sm ml-1"></div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Card de Jogo ---
const LiveGameCard = ({ game, isPinned, onPin }: { game: any, isPinned: boolean, onPin: () => void }) => {

  // Função principal getStat (declarada uma única vez)
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

  // Sua função original de Análise do Jogo (completa e corrigida para usar o getStat principal)
  const getGameConditions = (game: any) => {
    // A declaração duplicada de getStat foi removida daqui.
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

    // Posse de bola
    if (homePossession > 60) {
      conditions.push(`Time da casa domina a posse de bola (${homePossession}%).`);
    } else if (awayPossession > 60) {
      conditions.push(`Time visitante domina a posse de bola (${awayPossession}%).`);
    } else {
      conditions.push(`Posse de bola equilibrada.`);
    }

    // Ataques perigosos
    if (homeDanger > awayDanger) {
      conditions.push(`Mais ataques perigosos para a casa.`);
    } else if (awayDanger > homeDanger) {
      conditions.push(`Mais ataques perigosos para o visitante.`);
    } else {
      conditions.push(`Ataques perigosos equilibrados.`);
    }

    // Finalizações
    if (homeShots > awayShots) {
      conditions.push(`Casa finalizou mais a gol.`);
    } else if (awayShots > homeShots) {
      conditions.push(`Visitante finalizou mais a gol.`);
    } else {
      conditions.push(`Finalizações equilibradas.`);
    }

    // Escanteios
    if (homeCorners > awayCorners) {
      conditions.push(`Casa tem mais escanteios.`);
    } else if (awayCorners > homeCorners) {
      conditions.push(`Visitante tem mais escanteios.`);
    } else {
      conditions.push(`Escanteios equilibrados.`);
    }

    // Cartões
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

    // Faltas
    if (homeFouls > awayFouls) {
      conditions.push(`Casa com mais faltas.`);
    } else if (awayFouls > homeFouls) {
      conditions.push(`Visitante com mais faltas.`);
    }

    // Placar
    if (homeGoals > awayGoals) {
      conditions.push(`Casa vencendo por ${homeGoals} a ${awayGoals}.`);
    } else if (awayGoals > homeGoals) {
      conditions.push(`Visitante vencendo por ${awayGoals} a ${homeGoals}.`);
    } else {
      conditions.push(`Placar empatado em ${homeGoals} a ${awayGoals}.`);
    }

    // Sugestões de entrada (palpites)
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

  // Sua função original de Alerta de Momentum
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


  // --- MOTOR DE ALERTAS ---
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

    // --- PASSO 2: Cálculo da Dominância (a mesma lógica da DominanceBar) ---
    const homeDominanceScore = (stats.homeShotsOnGoal * 2) + (stats.homeCorners * 1.5) + stats.homeTotalShots;
    const awayDominanceScore = (stats.awayShotsOnGoal * 2) + (stats.awayCorners * 1.5) + stats.awayTotalShots;
    const totalDominance = homeDominanceScore + awayDominanceScore;

    const homeDominancePercentage = totalDominance > 0 ? (homeDominanceScore / totalDominance) * 100 : 50;
    const awayDominancePercentage = totalDominance > 0 ? (awayDominanceScore / totalDominance) * 100 : 50;


    // --- PASSO 3: Execução da Nova Regra ---

    // REGRA: Back Casa (Domínio em Jogo Empatado)
    if (
      elapsed >= 10 && elapsed <= 60 && // Condição de tempo ajustada
      game.goals.home === game.goals.away && // Condição de placar ajustada para EMPATE
      homeIPO > (awayIPO * 2.5) && // Pressão IPO da casa é 2.5x maior
      stats.homeTotalShots > (stats.awayTotalShots * 3) && // Volume de chutes é 3x maior
      stats.homeShotsOnGoal >= 4 && // Pelo menos 4 chutes no gol
      stats.homeCorners > (stats.awayCorners + 2) // Pelo menos 3 escanteios a mais
    ) {
      return {
        type: 'Back Casa (Domínio em Empate)',
        text: `Jogo empatado, mas a casa domina completamente as ações ofensivas.`,
        color: 'green'
      };
    }

    if (
      elapsed < 25 &&
      stats.homeTotalShots === 3 &&
      stats.homeShotsOnGoal >= 1 &&
      stats.awayShotsOnGoal === 0 &&
      homeDominancePercentage > 65 &&
      awayDominancePercentage < 35
    ) {
      return {
        type: 'Entrada Over 0.5 HT',
        text: `Pressão casa e domínio de ${homeDominancePercentage.toFixed(0)}%, enquanto visitante tem 0 chutes no gol.`,
        color: 'green'
      };
    }

    // REGRA: Over 2.5 FT (Baseado em Volume Ofensivo)
    if (
      elapsed > 15 && elapsed <= 30 &&// A regra começa a valer após os 20 minutos
      (stats.homeTotalShots + stats.awayTotalShots) >= 14 && // Pelo menos 14 chutes totais no jogo
      ((stats.homeShotsOnGoal >= 3 && stats.awayShotsOnGoal >= 2) || (stats.homeShotsOnGoal >= 2 && stats.awayShotsOnGoal >= 3)) && // Pelo menos 5 chutes no gol combinados, com ambos os times participando
      (stats.homePossession > 35 && stats.awayPossession > 35) // Evita jogos de "ataque contra defesa" onde só um time joga
    ) {
      return {
        type: 'Over 2.5 FT (Jogo Aberto)',
        text: 'Partida com alto volume de chutes e chances para ambos os lados. Tendência de gols.',
        color: 'blue'
      };
    }

    // REGRA: Over 1.5 FT (Explosão Ofensiva Mútua)
    if (
      elapsed >= 10 && elapsed <= 30 && // Janela de tempo
      totalGoals <= 0 && // O jogo tem 0 gol
      (stats.homeTotalShots + stats.awayTotalShots) >= 8 && // Pelo menos 8 chutes totais
      (stats.homeShotsOnGoal + stats.awayShotsOnGoal) >= 2 && // Pelo menos 2 chutes no gol
      stats.homeCorners >= 2 && stats.awayCorners >= 1 && // Pelo menos 1 escanteios para cada lado
      (homeIPO + awayIPO) > 40 // O índice de pressão combinado dos dois times é alto
    ) {
      return {
        type: 'Over 1.5 FT (Jogo Aberto)',
        text: 'Ambas as equipes estão finalizando e criando chances. Alta probabilidade de mais gols.',
        color: 'blue'
      };
    }

    // REGRA: Ambas Marcam (BTTS) em Jogo Aberto
    if (
      elapsed >= 1 && elapsed <= 20 && // Janela de tempo
      totalGoals === 0 && // Apenas em jogos 0x0
      (stats.homeShotsOnGoal >= 1 && stats.awayShotsOnGoal >= 1) && // AMBOS os times com chute no gol
      (stats.homeTotalShots + stats.awayTotalShots) >= 5 && // Pelo menos 5 chutes totais no jogo
      (homeIPO + awayIPO) > 20 // O índice de pressão combinado dos dois times é alto
    ) {
      return {
        type: 'Ambas Marcam (Jogo Aberto)',
        text: 'Jogo 0x0, mas com os dois times finalizando e criando chances. Tendência para gols de ambos os lados.',
        color: 'blue'
      };
    }

    // REGRA: Lay Casa (Favorito Apático)
    if (
      elapsed > 15 && elapsed < 60 && // Jogo já estabelecido
      game.goals.home === game.goals.away && // Jogo empatado
      stats.homePossession > 55 && // Casa tem a posse de bola...
      stats.awayTotalShots > stats.homeTotalShots && // ...mas o VISITANTE chuta mais
      stats.awayShotsOnGoal > stats.homeShotsOnGoal && // ...e o VISITANTE acerta mais o alvo
      awayIPO > homeIPO // ...e o IPO do VISITANTE é maior
    ) {
      return {
        type: 'Lay Casa (Visitante Perigoso)',
        text: 'Casa com posse de bola improdutiva. Visitante cria as melhores chances.',
        color: 'red'
      };
    }
    // Adicione suas outras regras aqui...

    return null; // Se nenhuma regra for atendida
  };

  // --- LÓGICA DE RENDERIZAÇÃO ---
 const hasStats = game.statistics && game.statistics.length > 0;
    const customAlert = generateBettingAlerts();
    const momentumSignalText = getMomentumSignal();

    return (
        <div className={`bg-white text-gray-800 rounded-lg p-2 flex flex-col space-y-2 shadow-lg border-2 ${isPinned ? 'border-amber-400' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5 truncate"><Image src={game.league.logo} alt={game.league.name} width={14} height={14} /> <span className="truncate text-gray-700 text-[11px]">{game.league.name}</span></div>
                <div className="flex items-center gap-2">
                    <button onClick={onPin} title="Fixar/Desafixar Jogo"><Star className={`w-4 h-4 transition-colors ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-gray-400 hover:text-amber-400'}`} /></button>
                    <span className="font-bold text-red-500 animate-pulse bg-red-100 px-1.5 py-0.5 rounded-md text-[11px]">{game.fixture.status.elapsed}&apos;</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex-1 text-center"><Image src={game.teams.home.logo} alt={game.teams.home.name} width={28} height={28} className="mx-auto mb-1" /><p className="font-semibold text-[11px] text-gray-800 truncate">{game.teams.home.name}</p></div>
                <div className="text-2xl font-bold text-gray-900 px-1">{game.goals.home} - {game.goals.away}</div>
                <div className="flex-1 text-center"><Image src={game.teams.away.logo} alt={game.teams.away.name} width={28} height={28} className="mx-auto mb-1" /><p className="font-semibold text-[11px] text-gray-800 truncate">{game.teams.away.name}</p></div>
            </div>

            {hasStats && <DominanceBar game={game} />}
            <GameTimelineChart game={game} />

            <div className="text-center mt-1">
                <a href={`https://www.fulltbet.com/buscar?query=${encodeURIComponent(game.teams.home.name + ' vs ' + game.teams.away.name)}`} target="_blank" rel="noopener noreferrer" className="inline-block text-orange-600 text-xs font-medium underline hover:text-green-800 transition">
                    Ver este jogo na Fulltbet →
                </a>
            </div>
            
            {hasStats && (
                <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg flex flex-col gap-1 text-xs text-blue-800">
                    <BrainCircuit className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p><span className="font-bold">Análise do Jogo:</span></p>
                    <p>{getGameConditions(game)}</p>
                </div>
            )}
            {hasStats && momentumSignalText && (
                <div className="bg-yellow-50 border border-yellow-300 p-2 rounded-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-xs text-yellow-800"><span className="font-bold">Alerta de Entrada:</span> {momentumSignalText}</p>
                </div>
            )}
            {customAlert && (
                <div className={`border p-2 rounded-lg flex items-center gap-2 bg-${customAlert.color}-50 border-${customAlert.color}-200`}>
                    <Zap className={`w-5 h-5 text-${customAlert.color}-500 flex-shrink-0`} />
                    <div className="text-xs">
                        <p className={`font-bold text-${customAlert.color}-800`}>Alerta: {customAlert.type}</p>
                        <p className={`text-${customAlert.color}-700`}>{customAlert.text}</p>
                    </div>
                </div>
            )}
            
            <div className="bg-gray-100 p-2 rounded-lg">
                {hasStats ? <DetailedStats game={game} events={game.events} /> : (<p className="text-center text-xs text-gray-500 py-10">Aguardando estatísticas...</p>)}
            </div>
        </div>
    );
};

  // --- Componente Principal ---
export default function ScannerCliente({ initialData }: { initialData: any }) {
    const [liveGames, setLiveGames] = useState(initialData?.liveGames || []);
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
                setLiveGames(data.liveGames || []);
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
        games = games.filter((game: any) => game.statistics && game.statistics.length > 0);
        
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
            return b.fixture.status.elapsed - a.fixture.status.elapsed;
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
                <h2 className="text-xl font-semibold text-gray-800">Nenhum jogo ao vivo no momento.</h2>
                <p className="text-gray-500 mt-2">A página irá atualizar automaticamente quando uma partida começar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
          <div className="flex justify-start">
            <Link href="/">
                <button className="flex items-center gap-2 bg-green-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">
                    <Home size={18} /> Ir para a Página Principal
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