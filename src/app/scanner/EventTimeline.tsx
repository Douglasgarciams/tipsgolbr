// ARQUIVO: src/app/scanner/EventTimeline.tsx
'use client';

import { useMemo, useState } from 'react';
import { Target, Flag, Shield, AlertCircle, ArrowLeftRight, Zap, ShieldCheck } from 'lucide-react';

const SvgText = (props: any) => {
  return <text {...props} />;
};

export const EventTimeline = ({ game }) => {
    const { events, teams, fixture } = game;
    const homeTeamId = teams.home.id;
    const totalTime = fixture.status.elapsed;
    const maxTime = Math.max(90, totalTime);
    const chartWidth = maxTime * 8; // barWidth = 8
    const chartHeight = 60;

    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    const eventMarkers = useMemo(() => {
        const markers: { minute: number, side: 'home' | 'away', description: string, icon: React.ReactNode }[] = [];
        if (!events || events.length === 0) return [];
        
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
                    markerIcon = <div className={`w-2 h-3 rounded-sm ${event.detail === 'Yellow Card' ? 'bg-yellow-400' : 'bg-red-600'}`}></div>;
                    break;
                // Adicione outros 'cases' aqui para mapear mais eventos da sua API
            }
            if (markerIcon && description) {
                markers.push({ minute: event.time.elapsed, side: event.team.id === homeTeamId ? 'home' : 'away', description, icon: markerIcon });
            }
        });
        return markers;
    }, [events, homeTeamId]);

    if (eventMarkers.length === 0) {
        return (
            <div className="w-full h-16 flex items-center justify-center">
                <p className="text-xs text-gray-400">Nenhum evento principal registrado.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-16 mt-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                <line x1="0" y1={chartHeight/2} x2={chartWidth} y2={chartHeight/2} stroke="#e5e7eb" strokeWidth="2" />
                {eventMarkers.map((marker, idx) => (
                    <g key={idx} transform={`translate(${marker.minute * 8}, ${marker.side === 'home' ? 10 : 35})`} onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, content: `${marker.minute}&apos; - ${marker.description}` })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}>
                        {marker.icon}
                    </g>
                ))}
                <line x1={totalTime * 8} y1="0" x2={totalTime * 8} y2={chartHeight} stroke="#f59e0b" strokeWidth="2" />
            </svg>
            {tooltip && ( <div className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10" style={{ top: tooltip.y - 30, left: tooltip.x, transform: 'translateX(-50%)' }}>{tooltip.content}</div> )}
        </div>
    );
};