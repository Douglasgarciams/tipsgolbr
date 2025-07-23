// src/app/placares/page.js
"use client";

import { useState, useEffect, useMemo, useRef } from "react";

// --- Ícone de seta para expandir/colapsar ligas ---
const ChevronUpIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);
const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// --- Componente Skeleton para carregamento ---
function SkeletonCard() {
  return (
    <div className="animate-pulse flex items-center space-x-4 bg-gray-800 p-4 rounded-lg shadow mb-3">
      <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="h-6 bg-gray-700 rounded w-1/6"></div>
    </div>
  );
}

// --- Função auxiliar para comparar datas (mantida) ---
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export default function PlacaresPage() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Para forçar o refresh de dados
  const [expandedLeagues, setExpandedLeagues] = useState({}); // Para controlar o estado de expansão das ligas
  const isFetchingRef = useRef(false); // Flag para controlar requisições concorrentes

  // --- Fetch de jogos (com auto-atualização a cada 60 segundos para ao vivo) ---
  useEffect(() => {
    async function fetchJogosData() {
      if (isFetchingRef.current) { 
        console.log("Já buscando dados, ignorando nova requisição.");
        return;
      }

      isFetchingRef.current = true; 
      setLoading(true);
      setError(null);

      // NOVO: Adiciona um timeout para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

      try {
        console.log("Iniciando busca de dados de jogos...");
        const res = await fetch("/api/fetch-daily-games", { signal: controller.signal }); 
        clearTimeout(timeoutId); // Limpa o timeout se a requisição for concluída

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || `Erro HTTP: ${res.status}`);
        }
        const data = await res.json();
        setJogos(data.games || []); 
        console.log("Busca de dados de jogos concluída.");
      } catch (err) {
        if (err.name === 'AbortError') {
          setError("A busca de dados demorou muito e foi cancelada. Tente novamente.");
          console.error("Fetch Abortado por Timeout:", err);
        } else {
          setError(err.message || "Erro ao buscar jogos.");
          console.error("Falha ao buscar jogos da API:", err);
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false; 
      }
    }
    fetchJogosData();

    // Atualiza a cada 60 segundos (para simular ao vivo e manter dados frescos)
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 60000); 
    return () => clearInterval(interval); 
  }, [refreshKey]); 

  // --- Agrupamento de jogos por status e liga ---
  const groupedAndSortedJogos = useMemo(() => {
    const agora = new Date();
    const jogosPorLiga = {};

    jogos.forEach((jogo) => {
      let statusGroup = ''; 

      // Determinar o grupo de status
      if (jogo.status === "LIVE" || jogo.status === "1H" || jogo.status === "2H" || jogo.status === "HT" || jogo.status === "ET" || jogo.status === "BT" || jogo.status === "P" || jogo.status === "INT" || jogo.status === "ABAN" || jogo.status === "SUSP") {
        statusGroup = 'aoVivo';
      } else if (jogo.status === "FT" || jogo.status === "AET" || jogo.status === "PEN") {
        statusGroup = 'finalizado';
      } else { 
        const dataJogo = new Date(jogo.dataHora);
        const isToday = isSameDay(dataJogo, agora);
        const isTomorrow = isSameDay(dataJogo, new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1));

        if (isToday) {
            statusGroup = 'hoje';
        } else if (isTomorrow) {
            statusGroup = 'amanha';
        } else {
            statusGroup = 'outros'; 
        }
      }

      // Adicionar jogo ao grupo de status e depois à liga
      if (!jogosPorLiga[statusGroup]) {
        jogosPorLiga[statusGroup] = {};
      }
      if (!jogosPorLiga[statusGroup][jogo.competicao]) {
        jogosPorLiga[statusGroup][jogo.competicao] = {
          id: jogo.competicao, 
          name: jogo.competicao,
          games: [],
        };
      }
      jogosPorLiga[statusGroup][jogo.competicao].games.push(jogo);
    });

    // Ordenar jogos dentro de cada liga por data/hora
    Object.values(jogosPorLiga).forEach(group => {
      Object.values(group).forEach(league => {
        league.games.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
      });
    });

    return jogosPorLiga;
  }, [jogos]); 

  // --- Renderização do Conteúdo ---
  const renderLeagueSection = (title, gamesByLeague, titleColorClass) => {
    const leagueNames = Object.keys(gamesByLeague).sort(); 

    return (
      <section className="mb-8">
        <h2 className={`text-xl font-bold ${titleColorClass} mb-4`}>{title}</h2>
        {leagueNames.length === 0 && !loading && (
          <p className="text-gray-500 text-center">Nenhum jogo disponível nesta seção.</p>
        )}
        {leagueNames.map((leagueName) => {
          const league = gamesByLeague[leagueName];
          const isExpanded = expandedLeagues[league.id] === undefined ? true : expandedLeagues[league.id]; 

          return (
            <div key={league.id} className="bg-gray-700 rounded-lg shadow-md mb-4 overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-3 bg-gray-600 hover:bg-gray-500 transition cursor-pointer"
                onClick={() => setExpandedLeagues(prev => ({ ...prev, [league.id]: !prev[league.id] }))}
              >
                <span className="font-semibold text-white">{league.name}</span>
                {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-white" /> : <ChevronDownIcon className="w-5 h-5 text-white" />}
              </button>
              {isExpanded && (
                <div className="p-3 space-y-2">
                  {league.games.map((jogo) => (
                    <div key={jogo.id} className="flex justify-between items-center text-sm text-white bg-gray-800 p-3 rounded">
                      <div className="flex-1">
                        <p className="font-semibold">{jogo.jogo}</p>
                        <p className="text-xs text-gray-400">{new Date(jogo.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base">{jogo.placar || '-'}</p>
                        <p className={`text-xs ${
                            jogo.status === 'LIVE' ? 'text-green-400' :
                            jogo.status === 'FT' ? 'text-blue-400' :
                            'text-gray-400'
                        }`}>{jogo.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    );
  };


  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 mb-8 rounded-lg shadow-xl bg-gray-900">
        <h1 className="text-3xl font-bold text-blue-400">Placares ao Vivo & Resultados</h1>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          aria-label="Atualizar jogos"
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.636 17.364A8 8 0 1118.364 6.636" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.636 17.364A8 8 0 1118.364 6.636" />
            </svg>
          )}
          Atualizar
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center font-medium text-lg">{error}</p>
      ) : Object.keys(groupedAndSortedJogos).length === 0 ? (
        <p className="text-gray-400 text-center text-lg mt-10">Nenhum jogo encontrado para hoje ou amanhã nas ligas selecionadas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Seção Jogos Ao Vivo */}
          {groupedAndSortedJogos.aoVivo && Object.keys(groupedAndSortedJogos.aoVivo).length > 0 &&
            renderLeagueSection('Ao Vivo', groupedAndSortedJogos.aoVivo, 'text-red-400')
          }

          {/* Seção Jogos Hoje */}
          {groupedAndSortedJogos.hoje && Object.keys(groupedAndSortedJogos.hoje).length > 0 &&
            renderLeagueSection('Jogos Hoje', groupedAndSortedJogos.hoje, 'text-blue-400')
          }

          {/* Seção Jogos Amanhã */}
          {groupedAndSortedJogos.amanha && Object.keys(groupedAndSortedJogos.amanha).length > 0 &&
            renderLeagueSection('Jogos Amanhã', groupedAndSortedJogos.amanha, 'text-green-400')
          }

          {/* Seção Jogos Finalizados */}
          {groupedAndSortedJogos.finalizado && Object.keys(groupedAndSortedJogos.finalizado).length > 0 &&
            renderLeagueSection('Finalizados', groupedAndSortedJogos.finalizado, 'text-purple-400')
          }

          {/* Outros jogos (se houver, como PST, CANC etc. não filtrados por hoje/amanhã explicitamente) */}
          {groupedAndSortedJogos.outros && Object.keys(groupedAndSortedJogos.outros).length > 0 &&
            renderLeagueSection('Outros Jogos', groupedAndSortedJogos.outros, 'text-gray-400')
          }
        </div>
      )}
    </div>
  );
}
