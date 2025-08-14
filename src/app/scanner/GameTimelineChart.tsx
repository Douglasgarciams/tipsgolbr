'use client';
import { Shirt, Target, Shield, AlertTriangle, Goal } from 'lucide-react';
import { motion } from 'framer-motion';

// --- O Componente GameTimelineChart com Novo Design e Marcadores de Tempo ---
export const GameTimelineChart = ({ game }: { game: any }) => {
    const events = game.events || [];
    const elapsed = game.fixture.status.elapsed || 0;

    // Função para mapear o tipo de evento a um ícone e cor
    const getEventDisplay = (event: any) => {
        switch (event.type) {
            case 'Goal':
                return { 
                    Icon: Goal, 
                    color: 'text-green-500', 
                    label: `Gol ${event.team.name} (${event.player.name})` 
                };
            case 'Card':
                return { 
                    Icon: AlertTriangle, 
                    color: event.detail === 'Yellow Card' ? 'text-yellow-400' : 'text-red-500', 
                    label: `${event.detail} (${event.player.name})`
                };
            case 'subst':
                return { 
                    Icon: Shirt, 
                    color: 'text-blue-400', 
                    label: `Substituição ${event.team.name}`
                };
            default:
                return null;
        }
    };

    // Array para os marcadores de tempo
    const timeMarkers = ['15\'', '30\'', '45\'', '60\'', '75\''];

    return (
        <div className="w-full my-4">
            {/* A barra de tempo principal */}
            <div className="relative h-6 bg-gray-700/50 rounded-full flex items-center px-1">
                {/* Linha de progresso do tempo atual */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-amber-500/80 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(elapsed / 90) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                />
                <motion.div
                    className="absolute top-[-4px] h-8 w-1 bg-white rounded-full shadow-lg"
                    initial={{ left: '0%' }}
                    animate={{ left: `calc(${(elapsed / 90) * 100}% - 2px)` }}
                    transition={{ duration: 1, ease: "linear" }}
                />

                {/* Marcadores de eventos na barra */}
                {events.map((event: any, index: number) => {
                    const display = getEventDisplay(event);
                    if (!display) return null;

                    const position = (event.time.elapsed / 90) * 100;
                    const { Icon, color, label } = display;
                    
                    return (
                        <motion.div
                            key={index}
                            className="absolute -top-1.5 z-10 group"
                            style={{ left: `${position}%` }}
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ delay: 0.2 * index, type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Icon className={`${color} w-5 h-5 bg-gray-800 rounded-full p-0.5 border-2 border-gray-500 cursor-pointer`} />
                            {/* Tooltip com a informação do evento */}
                            <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2">
                                {label} aos {event.time.elapsed}'
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* NOVA SEÇÃO: MARCADORES DE TEMPO */}
            <div className="relative flex justify-between w-full px-1 mt-1">
                {timeMarkers.map((time, index) => {
                    const position = ((index + 1) * 15 / 90) * 100;
                    return (
                        <div key={time} className="absolute text-center" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
                            <span className="text-xs text-gray-400 font-mono">{time}</span>
                        </div>
                    );
                })}
            </div>

            {/* Legenda */}
            <div className="flex justify-center items-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <Goal size={14} className="text-green-500" /> Gol
                </div>
                <div className="flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-yellow-400" /> Cartão
                </div>
                <div className="flex items-center gap-1.5">
                    <Shirt size={14} className="text-blue-400" /> Substituição
                </div>
            </div>
        </div>
    );
};