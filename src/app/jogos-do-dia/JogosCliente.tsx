// ARQUIVO: src/app/jogos-do-dia/JogosCliente.tsx
'use client';
import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { LoaderCircle, Search, ChevronDown, BrainCircuit, X } from 'lucide-react';
import Link from 'next/link';
import { RadarAnalysisChart } from './RadarChart';
import { BacktestAnalysisPanel } from './BacktestAnalysisPanel';

// ADICIONADO: Filtro de Ligas Permitidas
  const ALLOWED_LEAGUE_IDS = [
    2, 3, 4, 13, 11, 31, 39, 40, 41, 42, 43, 45, 47, 48, 98, 101, 102, 103, 106, 107, 108, 109, 114, 119, 120, 124, 125, 128, 129, 130, 131, 140, 141, 173, 175, 176, 177, 178, 179, 182, 181, 184, 185, 135, 136, 219, 220, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 262, 264, 271, 272, 282, 283, 281, 284, 285, 286, 292, 293, 294, 295, 328, 329, 345, 347, 78, 473, 474, 501, 503, 527, 558, 559, 633, 638, 497, 519, 555, 557, 592, 593, 548, 657, 722, 727, 807, 810, 4330, 4395, 4888, 4400, 21, 79, 61, 62, 94, 88, 71, 72, 144, 147, 253, 113, 207, 208, 307, 203, 218, 15, 1
  ];
// --- Subcomponentes de UI (NÃO ALTERADOS) ---
const GameRow = ({ fixture }: any) => (
    <div className="flex items-center p-2 bg-gray-200 rounded-md text-sm my-1">
        <span className="text-gray-600 font-semibold mr-2 w-1/5">{new Date(fixture.fixture.date).toLocaleDateString()}</span>
        <div className="flex items-center flex-1">
            <span className="text-right w-2/5 truncate font-bold text-black">{fixture.teams.home.name}</span>
            <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} width={16} height={16} className="mx-2"/>
            <span className="font-bold bg-gray-300 text-black px-2 py-0.5 rounded-md">{fixture.goals.home} - {fixture.goals.away}</span>
            <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} width={16} height={16} className="mx-2"/>
            <span className="w-2/5 truncate font-bold text-black">{fixture.teams.away.name}</span>
        </div>
    </div>
);

const TeamFormAnalysis = ({ teamName, teamId, teamForm }: { teamName: string, teamId: number, teamForm: any[] }) => {
  if (!teamForm || teamForm.length === 0) {
    return <p className="text-gray-500 text-center text-sm py-2">Dados de forma não disponíveis.</p>;
  }
  const formResults = teamForm.map(game => {
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
          <span key={index} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${ result === 'V' ? 'bg-green-500 text-white' : result === 'D' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white' }`}>{result}</span>
        ))}
      </div>
      <div className="space-y-1">{teamForm.map((game) => <GameRow key={game.fixture.id} fixture={game} />)}</div>
    </div>
  );
};

const OddMarket = ({ title, oddsData }: { title: string, oddsData: any }) => {
    // Mantemos a sua verificação original, que funciona para os seus dados
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
                    // --- AQUI ESTÁ A ÚNICA ALTERAÇÃO ---
                    // Lógica para definir a cor baseada no nome da aposta
                    const isOver = odd.value.startsWith('Over');
                    
                    const bgColor = isOver ? 'bg-green-100' : 'bg-red-100';
                    const textColor = isOver ? 'text-green-800' : 'text-red-800';
                    const oddColor = isOver ? 'text-green-900' : 'text-red-900';

                    // Lógica para "Vencedor da Partida" ter cores diferentes
                    if (title === 'Vencedor da Partida') {
                        return (
                            <div key={odd.value} className="bg-blue-200 p-2 rounded-md">
                                <p className="text-xs text-blue-800">{odd.value}</p>
                                <p className="font-bold text-blue-800">{odd.odd}</p>
                            </div>
                        );
                    }

                    // Renderiza com as cores para Over/Under
                    return (
                        <div key={odd.value} className={`${bgColor} p-2 rounded-md`}>
                            <p className={`text-xs font-medium ${textColor}`}>{odd.value}</p>
                            <p className={`font-bold ${oddColor}`}>{odd.odd}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

// --- NOVO: Componente para o Modal de Análise da IA ---
const AiAnalysisModal = ({ fixtureData, analysisData, pageData, onClose }: any) => {
    const { teams, league } = fixtureData;

    // Lógica da IA para gerar a análise completa
    const generateDetailedAnalysis = () => {
        if (!analysisData || !pageData.standings[league.id]) {
            return { summary: "Dados insuficientes para gerar uma análise completa.", suggestion: null };
        }

        const { h2h, homeTeamForm, awayTeamForm, odds } = analysisData;
        const standings = pageData.standings[league.id];
        
        let homeScore = 0;
        let awayScore = 0;
        let summary = [];

        // 1. Análise da Classificação
        const homeRank = standings.find((t: any) => t.team.id === teams.home.id)?.rank ?? 50;
        const awayRank = standings.find((t: any) => t.team.id === teams.away.id)?.rank ?? 50;
        if (homeRank < awayRank) homeScore += 2; else if (awayRank < homeRank) awayScore += 2;
        summary.push(`O ${teams.home.name} está na ${homeRank}ª posição, enquanto o ${teams.away.name} está na ${awayRank}ª.`);

        // 2. Análise da Forma Recente
        const getFormScore = (form: any[], teamId: number) => form.reduce((score, game) => {
            const isHome = game.teams.home.id === teamId;
            const goalsFor = isHome ? game.goals.home : game.goals.away;
            const goalsAgainst = isHome ? game.goals.away : game.goals.home;
            if (goalsFor > goalsAgainst) return score + 3;
            if (goalsFor === goalsAgainst) return score + 1;
            return score;
        }, 0);
        const homeFormScore = getFormScore(homeTeamForm, teams.home.id);
        const awayFormScore = getFormScore(awayTeamForm, teams.away.id);
        if (homeFormScore > awayFormScore) homeScore += 1.5; else if (awayFormScore > homeFormScore) awayScore += 1.5;
        summary.push(`Em termos de forma, o ${teams.home.name} somou ${homeFormScore} pontos nos últimos 5 jogos, e o ${teams.away.name} somou ${awayFormScore}.`);

        // 3. Análise de Golos
        const getGoalAvg = (form: any[], teamId: number) => {
            if (!form || form.length === 0) return { scored: 0, conceded: 0 };
            const metrics = form.reduce((acc, game) => {
                const isHome = game.teams.home.id === teamId;
                acc.scored += isHome ? game.goals.home : game.goals.away;
                acc.conceded += isHome ? game.goals.away : game.goals.home;
                return acc;
            }, { scored: 0, conceded: 0 });
            return { scored: metrics.scored / form.length, conceded: metrics.conceded / form.length };
        };
        const homeGoals = getGoalAvg(homeTeamForm, teams.home.id);
        const awayGoals = getGoalAvg(awayTeamForm, teams.away.id);
        if (homeGoals.scored > awayGoals.scored) homeScore += 1; else if (awayGoals.scored > homeGoals.scored) awayScore += 1;
        if (homeGoals.conceded < awayGoals.conceded) homeScore += 1; else if (awayGoals.conceded < homeGoals.conceded) awayScore += 1;
        summary.push(`A média de golos marcados é de ${homeGoals.scored.toFixed(2)} para a equipa da casa e ${awayGoals.scored.toFixed(2)} para a visitante.`);

        // 4. Análise H2H
        if (h2h.length > 0) {
            const lastH2h = h2h[0];
            if(lastH2h.teams.home.winner) homeScore += 1;
            if(lastH2h.teams.away.winner) awayScore += 1;
            summary.push(`No último confronto direto, o resultado foi ${lastH2h.teams.home.name} ${lastH2h.goals.home} x ${lastH2h.goals.away} ${lastH2h.teams.away.name}.`);
        }

                        // Conclusão e Palpite Final - versão expandida
let suggestion = "Jogo equilibrado, sem uma entrada clara de valor.";

const avgGoals = (homeGoals.scored + awayGoals.scored) / 2;
const goalDiff = Math.abs(homeGoals.scored - awayGoals.scored);
const totalScoreDiff = homeScore - awayScore;

if (homeScore > awayScore + 2) {
    suggestion = `Back ${teams.home.name}: A análise mostra uma vantagem considerável para a equipa da casa.`;
} else if (awayScore > homeScore + 2) {
    suggestion = `Back ${teams.away.name}: A análise aponta para um favoritismo da equipa visitante.`;
} else if (avgGoals > 2.5) {
    suggestion = "Over 2.5 Golos: Ambas as equipas têm bom potencial ofensivo, sugerindo um jogo com gols.";
} else if (avgGoals < 1.5) {
    suggestion = "Under 2.5 Golos: Espera-se um jogo mais defensivo e com poucos gols.";
} else if (goalDiff > 1) {
    suggestion = "Possível vitória clara: Diferença significativa na média de gols entre as equipas.";
} else if (totalScoreDiff >= 1) {
    suggestion = "Leve favoritismo para a equipa da casa baseado na análise geral.";
} else if (totalScoreDiff <= -1) {
    suggestion = "Leve favoritismo para a equipa visitante baseado na análise geral.";
} else if (homeFormScore > awayFormScore + 3) {
    suggestion = `Equipe da casa (${teams.home.name}) em melhor forma recente, pode fazer a diferença.`;
} else if (awayFormScore > homeFormScore + 3) {
    suggestion = `Equipe visitante (${teams.away.name}) em melhor forma recente, atenção para surpresa.`;
} else {
    suggestion = "Jogo equilibrado, pode ser definido por detalhes ou bola parada.";
}

        
        return { summary: summary.join(' '), suggestion };
    };

    const { summary, suggestion } = generateDetailedAnalysis();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black"><X size={24} /></button>
                <div className="flex items-center gap-3 mb-4">
                    <BrainCircuit className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold">Dicas Tipsdicas - Análise IA</h2>
                </div>
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-bold text-base text-gray-900">Resumo do Confronto:</h4>
                        <p className="text-gray-700">{summary}</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                        <h4 className="font-bold text-base text-gray-900">Palpite Final:</h4>
                        <p className="text-gray-800 font-semibold">{suggestion}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};



// --- NOVO SUB-COMPONENTE PARA ORGANIZAR AS ODDS DE MAIS/MENOS ---
const OverUnderOddsMarket = ({ markets }) => {
  // Lista de mercados que queremos exibir
  const goalLines = ['0.5', '1.5', '2.5', '3.5'];

  // Função para encontrar o valor da odd específica (ex: 'Over 1.5')
  const getOddValue = (marketData, value) => {
    return marketData?.response?.[0]?.bookmakers?.[0]?.bets?.[0]?.values.find(o => o.value === value)?.odd || '-';
  }

  return (
    <div>
      <h5 className="font-bold text-gray-800 mb-2">Mais / Menos</h5>
      <div className="grid grid-cols-2 gap-2 text-center">
        {/* Renderiza as linhas de odds */}
        {goalLines.map(line => {
          const marketData = markets?.[`overUnder_${line.replace('.', '_')}`];
          return (
            <React.Fragment key={line}>
              {/* Bloco OVER (com cores verdes) */}
              <div className="bg-green-100 p-2 rounded-md">
                <p className="text-xs text-green-800 font-medium">Mais de {line}</p>
                <p className="font-bold text-green-900">{getOddValue(marketData, `Over ${line}`)}</p>
              </div>
              {/* Bloco UNDER (com cores vermelhas) */}
              <div className="bg-red-100 p-2 rounded-md">
                <p className="text-xs text-red-800 font-medium">Menos de {line}</p>
                <p className="font-bold text-red-900">{getOddValue(marketData, `Under ${line}`)}</p>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// --- NOVO SUB-COMPONENTE PARA EXIBIR AS ESCALAÇÕES ---
// --- NOVO SUB-COMPONENTE PARA EXIBIR AS ESCALAÇÕES (ADICIONADO) ---
const LineupsPanel = ({ lineupData }: { lineupData: any[] }) => {
    if (!lineupData || lineupData.length < 2) {
        return <p className="text-gray-500 text-center text-sm py-2">Escalações não disponíveis.</p>;
    }

    const homeLineup = lineupData[0];
    const awayLineup = lineupData[1];

    const PlayerList = ({ title, players }: { title: string, players: any[] }) => (
        <div>
            <h5 className="font-bold text-sm mb-2 text-gray-800">{title}</h5>
            <ul className="space-y-1 text-xs">
                {players.map(p => (
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
                <div className="flex items-center gap-2 mb-3">
                    <Image src={homeLineup.team.logo} alt={homeLineup.team.name} width={24} height={24} />
                    <p className="font-bold text-base text-black">{homeLineup.team.name} ({homeLineup.formation})</p>
                </div>
                <div className="space-y-4">
                    <PlayerList title="Titulares" players={homeLineup.startXI} />
                    <PlayerList title="Reservas" players={homeLineup.substitutes} />
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Image src={awayLineup.team.logo} alt={awayLineup.team.name} width={24} height={24} />
                    <p className="font-bold text-base text-black">{awayLineup.team.name} ({awayLineup.formation})</p>
                </div>
                <div className="space-y-4">
                    <PlayerList title="Titulares" players={awayLineup.startXI} />
                    <PlayerList title="Reservas" players={awayLineup.substitutes} />
                </div>
            </div>
        </div>
    );
};

// --- Painel de Análise ---
// Substitua seu AnalysisPanel inteiro por este
const AnalysisPanel = ({ fixtureData, analysisData, pageData, isLoading, onOpenModal }: any) => {
  console.log("DADOS DE ANÁLISE RECEBIDOS PELO PAINEL:", analysisData);
  const [activeTab, setActiveTab] = useState('radar'); // <-- Inicia na nova aba Radar
  const { fixture, teams, league, goals } = fixtureData;

  // --- NOVO: LÓGICA PARA CALCULAR MÉDIA DE GOLS ---
  // Usamos useMemo para que o cálculo seja feito apenas uma vez quando os dados chegarem
  const goalAverages = useMemo(() => {
    // Função interna para calcular as médias
    const calculate = (teamForm, teamId) => {
      if (!teamForm || teamForm.length === 0) return { scored: 0, conceded: 0 };
      
      const metrics = teamForm.reduce((acc, game) => {
        const isThisTeamHome = game.teams.home.id === teamId;
        acc.scored += isThisTeamHome ? game.goals.home : game.goals.away;
        acc.conceded += isThisTeamHome ? game.goals.away : game.goals.home;
        return acc;
      }, { scored: 0, conceded: 0 });

      const numGames = teamForm.length;
      return {
        scored: metrics.scored / numGames,
        conceded: metrics.conceded / numGames
      };
    };

    // Certifica-se de que analysisData existe antes de tentar calcular
    if (!analysisData) return null;

    const home = calculate(analysisData.homeTeamForm, teams.home.id);
    const away = calculate(analysisData.awayTeamForm, teams.away.id);
    return { home, away };

  }, [analysisData, teams]);

  return (
    <div className="bg-white p-4 rounded-b-lg text-black border-t-2 border-blue-600">
      <div className="flex items-center justify-between mb-4">
          <div className="text-center w-1/3"><Image src={teams.home.logo} alt={teams.home.name} width={48} height={48} className="mx-auto h-auto"/><p className="font-bold mt-1 text-sm">{teams.home.name}</p></div>
          <div className="text-center">{fixture.status.short === 'NS' ? <p className="text-3xl font-light">vs</p> : <p className="text-3xl font-bold">{goals.home ?? '-'} : {goals.away ?? '-'}</p>}<p className="text-xs text-red-500">{fixture.status.long}</p></div>
          <div className="text-center w-1/3"><Image src={teams.away.logo} alt={teams.away.name} width={48} height={48} className="mx-auto h-auto"/><p className="font-bold mt-1 text-sm">{teams.away.name}</p></div>
      </div>
      
      {isLoading ? <div className="flex justify-center p-8"><LoaderCircle className="animate-spin"/></div> :
       !analysisData ? <p className="text-gray-500 text-center text-sm py-2">Análise não disponível.</p> :
       <>
       {/* --- NOVO: PAINEL DE MÉDIA DE GOLS ADICIONADO AQUI --- */}
         {goalAverages && (
            <div className="grid grid-cols-2 gap-4 text-center border-y py-3 my-4">
                <div>
                    <p className="font-bold text-sm text-gray-800">Média (Últimos {analysisData.homeTeamForm.length} Jogos)</p>
                    <div className="mt-2 space-y-1">
                        <p className="text-xs text-green-700 font-semibold">⚽ Marcados: <span className="text-base font-bold">{goalAverages.home.scored.toFixed(2)}</span></p>
                        <p className="text-xs text-red-700 font-semibold">🛡️ Sofridos: <span className="text-base font-bold">{goalAverages.home.conceded.toFixed(2)}</span></p>
                    </div>
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-800">Média (Últimos {analysisData.awayTeamForm.length} Jogos)</p>
                     <div className="mt-2 space-y-1">
                        <p className="text-xs text-green-700 font-semibold">⚽ Marcados: <span className="text-base font-bold">{goalAverages.away.scored.toFixed(2)}</span></p>
                        <p className="text-xs text-red-700 font-semibold">🛡️ Sofridos: <span className="text-base font-bold">{goalAverages.away.conceded.toFixed(2)}</span></p>
                    </div>
                </div>
            </div>
         )}
         <button onClick={onOpenModal} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors mb-4">
             <BrainCircuit size={20}/> Ver Análise da IA
         </button>
         <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
             <ul className="flex flex-wrap -mb-px">
                 {/* ABA NOVA ADICIONADA */}
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
            {/* CONTEÚDO DA NOVA ABA */}
            <h4 className="font-bold text-center text-green-800 mb-4">Últimos 5 Jogos</h4>
            {activeTab === 'stats' && <RecentGamesStatsPanel homeTeamForm={analysisData.homeTeamForm} awayTeamForm={analysisData.awayTeamForm} homeId={teams.home.id} awayId={teams.away.id} />}
            {activeTab === 'radar' && <RadarAnalysisChart analysisData={analysisData} homeName={teams.home.name} awayName={teams.away.name} homeId={teams.home.id} awayId={teams.away.id}/>}
            {activeTab === 'h2h' && <div className="space-y-1">{analysisData.h2h.length > 0 ? analysisData.h2h.map((game:any) => <GameRow key={game.fixture.id} fixture={game} />) : <p>Sem confrontos diretos.</p>}</div>}
            {activeTab === 'form' && <div className="space-y-4"><TeamFormAnalysis teamName={teams.home.name} teamId={teams.home.id} teamForm={analysisData.homeTeamForm} /><TeamFormAnalysis teamName={teams.away.name} teamId={teams.away.id} teamForm={analysisData.awayTeamForm} /></div>}
            {activeTab === 'standings' && (pageData.standings && pageData.standings[league.id] ? <table className="w-full text-left text-sm"><thead className="text-xs text-gray-900 uppercase bg-gray-50"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Time</th><th className="px-2 py-2">J</th><th className="px-2 py-2">SG</th><th className="px-2 py-2">Pts</th></tr></thead><tbody>{pageData.standings[league.id].map((team:any) => <tr key={team.team.id} className={`border-b ${team.team.id === teams.home.id || team.team.id === teams.away.id ? 'bg-blue-100' : ''}`}><td className="px-2 py-2">{team.rank}</td><td className="px-2 py-2 flex items-center"><Image src={team.team.logo} alt={team.team.name} width={16} height={16} className="mr-2"/>{team.team.name}</td><td className="px-2 py-2">{team.all.played}</td><td className="px-2 py-2">{team.goalsDiff}</td><td className="px-2 py-2 font-bold">{team.points}</td></tr>)}</tbody></table> : <p className="text-gray-500 text-center text-sm py-2">Classificação não disponível.</p>)}
            {activeTab === 'lineups' && <LineupsPanel lineupData={analysisData.lineup} />}
            {activeTab === 'odds' && (
                <div className="space-y-4">
                    <OddMarket title="Vencedor da Partida" oddsData={analysisData.odds.matchWinner} />
                    <OddMarket title="Mais/Menos" oddsData={analysisData.odds.overUnder_2_5} />
                </div>
            )}
            {/* 2. CONTEÚDO DA NOVA ABA (ACRESCENTADO) */}
            {activeTab === 'backtest' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BacktestAnalysisPanel teamForm={analysisData.homeTeamForm} teamId={teams.home.id} teamName={teams.home.name} />
                    <BacktestAnalysisPanel teamForm={analysisData.awayTeamForm} teamId={teams.away.id} teamName={teams.away.name} />
                </div>
            )}
           </div>
       </>
      }
    </div>
  );
};

// Componente para o Quadro de Estatísticas em % (Versão Final e Robusta)
const RecentGamesStatsPanel = ({ homeTeamForm, awayTeamForm, homeId, awayId }) => {

  const calculateRecentStats = (teamForm, teamId) => {
    if (!teamForm || teamForm.length === 0) return {};
    const numGames = teamForm.length;

    let stats = {
      htGoalScored: 0,
      over1_5: 0,
      over2_5: 0,
      blowoutsApplied: 0,
      blowoutsConceded: 0,
      scoredFirst: 0,
      concededFirst: 0,
      btts: 0,
      failedToScore: 0,
      cleanSheets: 0,
      scoredInST: 0,
      winsAtHome: 0,
      totalHomeGames: 0,
      winsAway: 0,
      totalAwayGames: 0,
      corners: 0,
    };

    teamForm.forEach(game => {
      const isThisTeamHome = game.teams.home.id === teamId;
      const scored = isThisTeamHome ? game.goals.home : game.goals.away;
      const conceded = isThisTeamHome ? game.goals.away : game.goals.home;
      const htScored = isThisTeamHome ? game.score.halftime.home : game.score.halftime.away;
      const htConceded = isThisTeamHome ? game.score.halftime.away : game.score.halftime.home;
      const stScored = scored - htScored;
      const totalGoals = game.goals.home + game.goals.away;

      
      
      // Suas estatísticas existentes
      if (htScored > 0) stats.htGoalScored++;
      if (totalGoals > 1.5) stats.over1_5++;
      if (totalGoals > 2.5) stats.over2_5++;
      if (totalGoals >= 4) {
        if (scored > conceded) stats.blowoutsApplied++;
        else if (conceded > scored) stats.blowoutsConceded++;
      }
      
      // CORREÇÃO DO BUG LÓGICO AQUI
      if (htScored !== null && htConceded !== null) {
        if (htScored > htConceded) {
          stats.scoredFirst++;
        } else if (htConceded > htScored) { // <-- CORRIGIDO AQUI
          stats.concededFirst++;
        }
      }

      // Novas estatísticas
      if (scored > 0 && conceded > 0) stats.btts++;
      if (scored === 0) stats.failedToScore++;
      if (conceded === 0) stats.cleanSheets++;
      if (stScored > 0) stats.scoredInST++;

      if (isThisTeamHome) {
        stats.totalHomeGames++;
        if (scored > conceded) stats.winsAtHome++;
      } else {
        stats.totalAwayGames++;
        if (scored > conceded) stats.winsAway++;
      }
    });
    
    // Função para converter em porcentagem (CORRIGIDA para retornar string)
    const toPercent = (value, total = numGames) => {
        if (total === 0) return '0';
        return (value / total * 100).toFixed(0);
    };
        
    return {
      'Jogos com gol no HT (%)': toPercent(stats.htGoalScored),
      'Jogos Over 1.5 FT (%)': toPercent(stats.over1_5),
      'Jogos Over 2.5 FT (%)': toPercent(stats.over2_5),
      'Goleadas Aplicadas (Venceu com 4+ gols)': toPercent(stats.blowoutsApplied),
      'Goleadas Sofridas (Perdeu com 4+ gols)': toPercent(stats.blowoutsConceded),
      'Marcou o 1º gol (no HT)': toPercent(stats.scoredFirst),
      'Sofreu o 1º gol (no HT)': toPercent(stats.concededFirst),
      'Ambas Marcam (%)': toPercent(stats.btts),
      'Jogos Sem Marcar Gol (%)': toPercent(stats.failedToScore),
      'Jogos Sem Sofrer Gol (%)': toPercent(stats.cleanSheets),
      'Jogos com Gol no 2ºT (%)': toPercent(stats.scoredInST),
      'Vitórias em Casa (%)': toPercent(stats.winsAtHome, stats.totalHomeGames),
      'Vitórias Fora (%)': toPercent(stats.winsAway, stats.totalAwayGames),
    };
  };
  
  const homeStats = calculateRecentStats(homeTeamForm, homeId);
  const awayStats = calculateRecentStats(awayTeamForm, awayId);
  const statLabels = Object.keys(homeStats);

  return (
    <div className="space-y-3 text-xs">
      {statLabels.map(label => (
        <div key={label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center justify-end">
            <span className="font-bold text-gray-700 mr-2">{homeStats[label]}%</span>
            <div className="w-20 bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${homeStats[label]}%` }}></div>
            </div>
          </div>
          <div className="text-center text-gray-500 font-semibold px-1">{label}</div>
          <div className="flex items-center">
            <div className="w-20 bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${awayStats[label]}%` }}></div>
            </div>
            <span className="font-bold text-gray-700 ml-2">{awayStats[label]}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Componente Principal ---
export default function JogosCliente({ initialData }: { initialData: any }) {
  const [expandedFixtureId, setExpandedFixtureId] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [activeDate, setActiveDate] = useState<'today' | 'tomorrow'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageData, setPageData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFixtureForModal, setSelectedFixtureForModal] = useState<any | null>(null);
  const [selectedLeague, setSelectedLeague] = useState('all');

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
    setIsAnalysisLoading(true); setAnalysisData(null);
    try {
      const { fixture, league, teams } = gameData;
      const params = new URLSearchParams({
        fixtureId: fixture.id.toString(), 
        leagueId: league.id.toString(),
        homeTeamId: teams.home.id.toString(), 
        awayTeamId: teams.away.id.toString(),
      });
      const response = await fetch(`/api/fixture-analysis?${params.toString()}`);
      if (!response.ok) throw new Error('Falha ao buscar análise');
      setAnalysisData(await response.json());
    } catch (error) { console.error("Erro ao buscar análise:", error); }
    finally { setIsAnalysisLoading(false); }
  };

  const handleSelectFixture = (fixtureId: number, gameData: any) => {
    if (expandedFixtureId === fixtureId) {
      setExpandedFixtureId(null);
    } else {
      setExpandedFixtureId(fixtureId);
      fetchAnalysis(gameData);
    }
  };

  const handleOpenAnalysisModal = (gameData: any) => {
    setSelectedFixtureForModal(gameData);
    setIsModalOpen(true);
  };

  

  // --- 2. LÓGICA PARA GERAR A LISTA DE CAMPEONATOS (ACRESCENTADA) ---
  const uniqueLeagues = useMemo(() => {
    if (!pageData?.fixtures) return [];
    const leagues = pageData.fixtures.map((game: any) => game.league);
    return [...new Map(leagues.map(item => [item['id'], item])).values()];
  }, [pageData]);

  const filteredFixtures = useMemo(() => {
    // Esta nova função usa os componentes locais da data, ignorando o fuso horário UTC
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const dateToFilter = activeDate === 'today' ? formatDate(new Date()) : formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    
    let fixtures = pageData?.fixtures
        ?.filter((f: any) => ALLOWED_LEAGUE_IDS.includes(f.league.id)) // <-- FILTRO APLICADO
        ?.filter((f: any) => f?.fixture?.date?.startsWith(dateToFilter)) || [];

        // Lógica do filtro de campeonato (ACRESCENTADA)
    if (selectedLeague !== 'all') {
        fixtures = fixtures.filter((f: any) => f.league.id.toString() === selectedLeague);
    }

    if (searchQuery.length > 2) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      fixtures = fixtures.filter((f: any) => 
        f.teams.home.name.toLowerCase().includes(lowerCaseQuery) ||
        f.teams.away.name.toLowerCase().includes(lowerCaseQuery) ||
        f.league.name.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    const grouped = fixtures.reduce((acc: any, curr: any) => {
      if (curr?.league?.name) {
        const leagueName = curr.league.name;
        if (!acc[leagueName]) {
          acc[leagueName] = { games: [], leagueId: curr.league.id };
        }
        acc[leagueName].games.push(curr);
      }
      return acc;
    }, {});

    return Object.entries(grouped).sort(([, a]: any, [, b]: any) => {
        const indexA = ALLOWED_LEAGUE_IDS.indexOf(a.leagueId);
        const indexB = ALLOWED_LEAGUE_IDS.indexOf(b.leagueId);
        return indexA - indexB;
    });

  }, [pageData, activeDate, searchQuery, selectedLeague]);

  if (!pageData || !pageData.fixtures) {
    return <div className="text-center text-amber-500">Falha ao carregar dados iniciais.</div>;
  }

  return (
    <>
    <div className="flex justify-end mb-4">
  <Link href="/scanner">
    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">
      🔍 Ir para Scanner
    </button>
  </Link>
</div>

        <div className="bg-white p-4 rounded-lg shadow h-fit space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-bold text-black">Data</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <button onClick={() => setActiveDate('today')} className={`p-2 rounded-md text-sm font-bold ${activeDate === 'today' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}>Hoje</button>
                        <button onClick={() => setActiveDate('tomorrow')} className={`p-2 rounded-md text-sm font-bold ${activeDate === 'tomorrow' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}>Amanhã</button>
                    </div>
                </div>

                {/* Filtro de Campeonato (ACRESCENTADO) */}
              <div>
                  <label className="text-sm font-bold text-black">Campeonato</label>
                  <select 
                    value={selectedLeague} 
                    onChange={(e) => setSelectedLeague(e.target.value)}
                    className="mt-1 w-full bg-gray-50 border border-gray-300 text-black rounded-md p-2 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">Todos os Campeonatos</option>
                    {uniqueLeagues.map((league: any) => (
                      <option key={league.id} value={league.id}>
                        {league.name} - {league.country}
                      </option>
                    ))}
                  </select>
              </div>

                <div>
                    <label className="text-sm font-bold text-black">Buscar</label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Time ou competição..." className="w-full bg-gray-50 border border-gray-300 text-black rounded-md p-2 pl-10 focus:ring-1 focus:ring-blue-500"/>
                    </div>
                </div>
            </div>
        </div>

        <main className="space-y-3">
            {filteredFixtures.map(([leagueName, leagueData]: [string, any]) => (
                <div key={leagueName} className="bg-white rounded-lg shadow">
                    <h3 className="text-sm font-bold text-black p-3 border-b flex items-center gap-2"><Image src={leagueData.games[0].league.logo} alt={leagueName} width={16} height={16} /> {leagueName}</h3>
                    <div className="p-1">
                        {leagueData.games.map((game: any) => (
                            <div key={game.fixture.id}>
                                <div onClick={() => handleSelectFixture(game.fixture.id, game)} className={`grid grid-cols-[60px_1fr_1fr_auto] items-center p-2 rounded-md cursor-pointer ${expandedFixtureId === game.fixture.id ? 'bg-blue-100 rounded-b-none' : 'hover:bg-gray-100'}`}>
                                    <span className="text-xs text-gray-700 font-semibold">{new Date(game.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="text-black text-sm text-right pr-2 truncate">{game.teams.home.name}</span>
                                    <span className="text-black text-sm text-left pl-2 truncate">{game.teams.away.name}</span>
                                    <ChevronDown className={`ml-auto text-gray-400 transition-transform ${expandedFixtureId === game.fixture.id ? 'rotate-180' : ''}`} size={20}/>
                                </div>
                                {expandedFixtureId === game.fixture.id && (
                                    <AnalysisPanel 
                                        fixtureData={game} 
                                        analysisData={analysisData} 
                                        pageData={pageData}
                                        isLoading={isAnalysisLoading} 
                                        onOpenModal={() => handleOpenAnalysisModal(game)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {filteredFixtures.length === 0 && <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow">Nenhum jogo encontrado para os filtros selecionados.</div>}
        </main>
        
        {isModalOpen && selectedFixtureForModal && (
            <AiAnalysisModal
                fixtureData={selectedFixtureForModal}
                analysisData={analysisData}
                pageData={pageData}
                onClose={() => setIsModalOpen(false)}
            />
        )}
    </>
  );
}
