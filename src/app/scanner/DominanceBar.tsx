'use client';
import { Target, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Componente DominanceBar com mais "Expressão" ---
export const DominanceBar = ({ game }: { game: any }) => {

    // =================================================================
    // 1. LÓGICA DE CÁLCULO (A mesma que já existia no seu projeto)
    // Colocamos ela aqui para que o componente seja independente.
    // =================================================================

    const getStat = (type: string) => {
        const homeStats = game.statistics?.find((s: any) => s.team.id === game.teams.home.id)?.statistics;
        const awayStats = game.statistics?.find((s: any) => s.team.id === game.teams.away.id)?.statistics;
        const homeStat = homeStats?.find((stat: any) => stat.type === type)?.value ?? 0;
        const awayStat = awayStats?.find((stat: any) => stat.type === type)?.value ?? 0;
        return { home: Number(homeStat), away: Number(awayStat) };
    };

    const shotsOnGoal = getStat('Shots on Goal');
    const corners = getStat('Corner Kicks');
    const totalShots = getStat('Total Shots');

    // Fórmula de Dominância (Chutes no Gol valem mais, depois escanteios, depois chutes totais)
    const homeDominanceScore = (shotsOnGoal.home * 2) + (corners.home * 1.5) + totalShots.home;
    const awayDominanceScore = (shotsOnGoal.away * 2) + (corners.away * 1.5) + totalShots.away;
    const totalDominance = homeDominanceScore + awayDominanceScore;

    const homePercentage = totalDominance > 0 ? (homeDominanceScore / totalDominance) * 100 : 50;
    const awayPercentage = totalDominance > 0 ? (awayDominanceScore / totalDominance) * 100 : 50;


    // =================================================================
    // 2. COMPONENTE VISUAL (O novo painel)
    // =================================================================

    return (
        <div className="w-full">
            {/* Título do Painel */}
            <div className="text-center text-xs text-gray-500 font-semibold mb-1.5">
                DOMINÂNCIA NA PARTIDA
            </div>
            
            {/* O Contêiner principal da barra */}
            <div className="flex w-full h-10 bg-gray-800 rounded-lg shadow-inner overflow-hidden border-2 border-gray-700">
                
                {/* Lado da Casa (Esquerda) */}
                <motion.div
                    className={`flex items-center justify-between px-3 relative bg-gradient-to-r from-blue-600 to-blue-500 ${homePercentage > awayPercentage ? 'animate-pulse' : ''}`}
                    initial={{ width: '50%' }}
                    animate={{ width: `${homePercentage}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                >
                    <span className="font-bold text-white text-lg drop-shadow-md">
                        {Math.round(homePercentage)}%
                    </span>
                    <div className="flex items-center gap-2 text-white">
                        <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span className="text-xs font-bold">{shotsOnGoal.home}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Flag size={14} />
                            <span className="text-xs font-bold">{corners.home}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Lado Visitante (Direita) */}
                <motion.div
                    className={`flex items-center justify-between px-3 relative bg-gradient-to-l from-red-600 to-red-500 ${awayPercentage > homePercentage ? 'animate-pulse' : ''}`}
                    initial={{ width: '50%' }}
                    animate={{ width: `${awayPercentage}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                >
                    <div className="flex items-center gap-2 text-white">
                        <div className="flex items-center gap-1">
                            <Flag size={14} />
                            <span className="text-xs font-bold">{corners.away}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span className="text-xs font-bold">{shotsOnGoal.away}</span>
                        </div>
                    </div>
                    <span className="font-bold text-white text-lg drop-shadow-md">
                        {Math.round(awayPercentage)}%
                    </span>
                </motion.div>
            </div>
        </div>
    );
};