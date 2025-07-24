// ARQUIVO: src/app/scanner/GameTimelineChart.tsx
'use client';

import { useMemo, useState } from 'react';
import { Target, Flag, ArrowLeftRight, Shield } from 'lucide-react';

const SvgText = (props: any) => <text {...props}></text>;

// Sub-componente para criar cada item da legenda de forma consistente
const LegendItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-1.5">
    {icon}
    <span className="text-gray-600">{label}</span>
  </div>
);

// --- Componente Principal do Gráfico (Versão Final) ---
export const GameTimelineChart = ({ game }: { game: any }) => {
  const { events, teams, fixture, statistics } = game;
  const homeTeamId = teams.home.id;
  const totalTime = fixture.status.elapsed;

  // --- Configurações Visuais ---
  const chartHeight = 160;
  const barWidth = 8;
  const maxTime = Math.max(90, totalTime);
  const chartWidth = maxTime * barWidth;
  const midLine = chartHeight / 2;

  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // --- Lógica para processar os eventos e criar os ícones ---
  const eventMarkers = useMemo(() => {
    const markers: { minute: number, side: 'home' | 'away', description: string, icon: React.ReactNode }[] = [];
    
    // 1. Adiciona marcadores da lista de 'events' (Gols, Cartões, etc.)
    if (events && events.length > 0) {
      events.forEach(event => {
        let markerIcon: React.ReactNode | null = null;
        let description: string | null = null;

        switch (event.type) {
          case 'Goal':
            description = `Gol - ${event.detail || ''}`;
            markerIcon = <SvgText fontSize="16">⚽</SvgText>;
            break;
          case 'Card':
            description = `Cartão ${event.detail === 'Yellow Card' ? 'Amarelo' : 'Vermelho'}`;
            markerIcon = <rect width="12" height="12" y="-6" fill={event.detail === 'Yellow Card' ? '#facc15' : '#dc2626'} rx="1" />;
            break;
          case 'subst':
            description = "Substituição";
            markerIcon = <ArrowLeftRight size={17} className="text-red-500" />;
            break;
          // O 'Shot on Goal' é removido daqui para ser reconstruído abaixo de forma mais confiável
        }

        if (markerIcon && description) {
          markers.push({ minute: event.time.elapsed, side: event.team.id === homeTeamId ? 'home' : 'away', description, icon: markerIcon });
        }
      });
    }

    // 2. RECONSTRÓI a linha do tempo de eventos a partir das 'statistics'
    if (statistics && statistics.length > 0) {
        const homeStats = statistics.find(s => s.team.id === homeTeamId)?.statistics;
        const awayStats = statistics.find(s => s.team.id !== homeTeamId)?.statistics;
        
        // --- LÓGICA PARA ESCANTEIOS (JÁ EXISTENTE) ---
        const homeCorners = parseInt(homeStats?.find(s => s.type === 'Corner Kicks')?.value || '0');
        const awayCorners = parseInt(awayStats?.find(s => s.type === 'Corner Kicks')?.value || '0');

        for (let i = 1; i <= homeCorners; i++) {
            const minute = Math.floor(totalTime * (i / (homeCorners + 1)));
            if (!markers.some(m => m.minute === minute && m.description === 'Escanteio')) {
                 markers.push({ minute, side: 'home', description: 'Escanteio', icon: <Flag size={12} className="text-blue-600" /> });
            }
        }
        for (let i = 1; i <= awayCorners; i++) {
            const minute = Math.floor(totalTime * (i / (awayCorners + 1)));
            if (!markers.some(m => m.minute === minute && m.description === 'Escanteio')) {
                markers.push({ minute, side: 'away', description: 'Escanteio', icon: <Flag size={15} className="text-blue-600" /> });
            }
        }

        // --- LÓGICA PARA CHUTES NO GOL (ADICIONADA) ---
        const homeShotsOnGoal = parseInt(homeStats?.find(s => s.type === 'Shots on Goal')?.value || '0');
        const awayShotsOnGoal = parseInt(awayStats?.find(s => s.type === 'Shots on Goal')?.value || '0');

        for (let i = 1; i <= homeShotsOnGoal; i++) {
            const minute = Math.floor(totalTime * (i / (homeShotsOnGoal + 1)));
            if (!markers.some(m => m.minute === minute && m.description === 'Chute no Gol')) {
                 markers.push({ minute, side: 'home', description: 'Chute no Gol', icon: <Target size={18} className="text-orange-500" /> });
            }
        }
        for (let i = 1; i <= awayShotsOnGoal; i++) {
            const minute = Math.floor(totalTime * (i / (awayShotsOnGoal + 1)));
            if (!markers.some(m => m.minute === minute && m.description === 'Chute no Gol')) {
                markers.push({ minute, side: 'away', description: 'Chute no Gol', icon: <Target size={18} className="text-orange-500" /> });
            }
        }
    }

    // 3. Ordena todos os marcadores por minuto
    return markers.sort((a, b) => a.minute - b.minute);

  }, [events, statistics, homeTeamId, totalTime]);
  
  // Dados da Legenda (sem alteração)
  const legendData = [
    { icon: <SvgText fontSize="12">⚽</SvgText>, label: 'Gol' },
    { icon: <div className="w-2 h-3 rounded-sm bg-yellow-400" />, label: 'Cartão' },
    { icon: <Target size={12} className="text-orange-500" />, label: 'Chute no Gol' },
    { icon: <Flag size={12} className="text-blue-500" />, label: 'Escanteio' },
    { icon: <ArrowLeftRight size={12} className="text-gray-500" />, label: 'Substituição' },
  ];

  if (eventMarkers.length === 0) {
    return ( <div className="w-full h-16 flex items-center justify-center bg-gray-50 rounded-lg mt-2"><p className="text-xs text-gray-400">Aguardando eventos...</p></div> );
  }

  return (
    <div className="w-full bg-white p-1 rounded-lg shadow-md">
      <div className="relative w-full h-30 mt-1">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
          <line x1="0" y1={midLine} x2={chartWidth} y2={midLine} stroke="#0a0a0aff" strokeWidth="2" />
          {eventMarkers.map((marker, idx) => {
              const yOffset = (eventMarkers.filter(m => m.minute === marker.minute).indexOf(marker)) * 30;
              const yPosition = marker.side === 'home' ? midLine - 30 - yOffset : midLine + 30 + yOffset;
              return (
                  <g
  key={idx}
  transform={`translate(${marker.minute * 8}, ${yPosition})`}
  onMouseEnter={(e) =>
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      // eslint-disable-next-line react/no-unescaped-entities
      content: `${marker.minute}${String.fromCharCode(39)} - ${marker.description}`
    })
  }
  onMouseLeave={() => setTooltip(null)}
  style={{ cursor: 'pointer' }}
>

                      {marker.icon}
                  </g>
              )
          })}
          
{/* --- CÓDIGO DO TEMPO (ADICIONADO AQUI) --- */}
          {Array.from({ length: Math.floor(maxTime / 10) + 1 }).map((_, i) => {
              const minute = i * 10;
              if (minute > 0 && minute < maxTime) { // Não mostra o 0' e o 90' para não sobrepor
                  return (
                      <text 
                        key={`time-${minute}`} 
                        x={minute * barWidth} 
                        y={midLine + 16} 
                        fontSize="18" 
                        fill="#080808ff" 
                        textAnchor="middle"
                      >
                          {minute}'
                      </text>
                  );
              }
              return null;
          })}

          <line x1={totalTime * 8} y1="0" x2={totalTime * 8} y2={chartHeight} stroke="#0e0d0dff" strokeWidth="2" />
        </svg>
        {tooltip && ( <div className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10" style={{ top: tooltip.y - 30, left: tooltip.x, transform: 'translateX(-50%)' }}>{tooltip.content}</div> )}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-2 text-xs">
        {legendData.map(item => ( <LegendItem key={item.label} icon={item.icon} label={item.label} /> ))}
      </div>
    </div>
  );
};