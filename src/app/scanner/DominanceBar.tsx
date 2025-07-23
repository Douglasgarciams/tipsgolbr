// ARQUIVO: src/app/scanner/DominanceBar.tsx
'use client';

// Função auxiliar para extrair estatísticas de forma segura
const getStat = (game, type) => {
    if (!game.statistics || game.statistics.length === 0) return { home: 0, away: 0 };
    const homeStats = game.statistics.find(s => s.team.id === game.teams.home.id)?.statistics;
    const awayStats = game.statistics.find(s => s.team.id === game.teams.away.id)?.statistics;
    
    const homeValue = homeStats?.find(stat => stat.type === type)?.value ?? (type.includes('Possession') ? '50%' : 0);
    const awayValue = awayStats?.find(stat => stat.type === type)?.value ?? (type.includes('Possession') ? '50%' : 0);
    
    // Converte para número, tratando strings de porcentagem e valores nulos
    const parseValue = (val) => {
      if (typeof val === 'string' && val.includes('%')) {
        return parseFloat(val.replace('%', ''));
      }
      return Number(val);
    };

    return { home: parseValue(homeValue), away: parseValue(awayValue) };
};

export const DominanceBar = ({ game }) => {
    // 1. Coletamos os dados, agora incluindo a Posse de Bola
    const homeShots = getStat(game, 'Total Shots').home;
    const homeShotsOnGoal = getStat(game, 'Shots on Goal').home;
    const homeCorners = getStat(game, 'Corner Kicks').home;
    const homePossession = getStat(game, 'Ball Possession').home;

    const awayShots = getStat(game, 'Total Shots').away;
    const awayShotsOnGoal = getStat(game, 'Shots on Goal').away;
    const awayCorners = getStat(game, 'Corner Kicks').away;
    const awayPossession = getStat(game, 'Ball Possession').away;

    // 2. ADICIONAMOS a posse de bola à Fórmula de Dominância com um peso
    // Exemplo de peso: 0.5 (você pode ajustar este valor)
    const homeDominance = (homeShotsOnGoal * 2) + (homeCorners * 1.5) + homeShots + (homePossession * 0.5);
    const awayDominance = (awayShotsOnGoal * 2) + (awayCorners * 1.5) + awayShots + (awayPossession * 0.5);
    
    const totalDominance = homeDominance + awayDominance;

    const homePercentage = totalDominance > 0 ? (homeDominance / totalDominance) * 100 : 50;
    const awayPercentage = totalDominance > 0 ? (awayDominance / totalDominance) * 100 : 50;

    return (
        <div className="w-full my-2">
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-200">
                <div className="bg-green-500" style={{ width: `${homePercentage}%` }}></div>
                <div className="bg-blue-500" style={{ width: `${awayPercentage}%` }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1 px-1">
                <span className="font-bold text-green-600">{homePercentage.toFixed(0)}%</span>
                <span className="font-semibold text-gray-500">Dominância</span>
                <span className="font-bold text-blue-600">{awayPercentage.toFixed(0)}%</span>
            </div>
        </div>
    );
};