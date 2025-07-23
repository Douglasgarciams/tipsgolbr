// ARQUIVO: src/app/jogos-do-dia/RadarChart.tsx
'use client';

import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const RadarAnalysisChart = ({ analysisData, homeName, awayName, homeId, awayId }) => {
  if (!analysisData || !analysisData.homeTeamForm || !analysisData.awayTeamForm || analysisData.homeTeamForm.length === 0) {
    return <p className="text-gray-500 text-center text-sm py-4">Dados insuficientes para o radar.</p>;
  }

  // --- FUNÇÃO DE NORMALIZAÇÃO PROPORCIONAL (CORRIGIDA) ---
  const normalizeMetrics = (homeValue, awayValue, lowerIsBetter = false) => {
    // Lida com números negativos (para Saldo de Gols)
    const minVal = Math.min(0, homeValue, awayValue);
    let h = homeValue - minVal;
    let a = awayValue - minVal;

    if (lowerIsBetter) { [h, a] = [a, h]; }
    
    const maxVal = Math.max(h, a);
    if (maxVal === 0) return { home: 50, away: 50 }; // Se ambos forem iguais (ou 0), ambos ficam no meio

    const homeNormalized = (h / maxVal) * 100;
    const awayNormalized = (a / maxVal) * 100;
    
    if (lowerIsBetter) {
        return { home: awayNormalized, away: homeNormalized };
    }
    return { home: homeNormalized, away: awayNormalized };
  };

  // --- FUNÇÕES PARA CALCULAR MÉTRICAS DOS ÚLTIMOS JOGOS ---
  const calculateMetrics = (teamForm, teamId) => {
    if (!teamForm || teamForm.length === 0) return { efficiency: 0, offensiveStrength: 0, defensiveStrength: 0, htStrength: 0, ftStrength: 0 };
    
    let efficiency = 0, goalsScored = 0, goalsConceded = 0, htScore = 0;

    teamForm.forEach(game => {
      const isThisTeamHome = game.teams.home.id === teamId;
      const scored = isThisTeamHome ? game.goals.home : game.goals.away;
      const conceded = isThisTeamHome ? game.goals.away : game.goals.home;
      const htScored = isThisTeamHome ? game.score.halftime.home : game.score.halftime.away;
      const htConceded = isThisTeamHome ? game.score.halftime.away : game.score.halftime.home;
      
      // Eficiência (FT)
      if (scored > conceded) efficiency += 3;
      else if (scored === conceded) efficiency += 1;
      
      // Força HT
      if (htScored > htConceded) htScore += 3;
      else if (htScored === htConceded) htScore += 1;

      goalsScored += scored;
      goalsConceded += conceded;
    });

    const numGames = teamForm.length;
    return {
      efficiency: (efficiency / (numGames * 3)) * 100,
      offensiveStrength: goalsScored / numGames,
      defensiveStrength: goalsConceded / numGames,
      htStrength: (htScore / (numGames * 3)) * 100,
      ftStrength: (goalsScored - goalsConceded) / numGames, // Força FT = Saldo de Gols Médio
    };
  };

  // 1. Definimos os novos eixos
  const labels = ['Eficiência', 'Força Ofensiva', 'Força Defensiva', 'Força de HT', 'Força FT (Saldo)'];
  
  // 2. Coletamos e calculamos os dados brutos
  const homeMetrics = calculateMetrics(analysisData.homeTeamForm, homeId);
  const awayMetrics = calculateMetrics(analysisData.awayTeamForm, awayId);
  
  // 3. Normalizamos cada métrica individualmente
  const efficiencyScores = normalizeMetrics(homeMetrics.efficiency, awayMetrics.efficiency);
  const offensiveScores = normalizeMetrics(homeMetrics.offensiveStrength, awayMetrics.offensiveStrength);
  const defensiveScores = normalizeMetrics(homeMetrics.defensiveStrength, awayMetrics.defensiveStrength, true); // lowerIsBetter
  const htScores = normalizeMetrics(homeMetrics.htStrength, awayMetrics.htStrength);
  const ftScores = normalizeMetrics(homeMetrics.ftStrength, awayMetrics.ftStrength);

  const data = {
    labels,
    datasets: [
      {
        label: homeName,
        data: [efficiencyScores.home, offensiveScores.home, defensiveScores.home, htScores.home, ftScores.home],
        backgroundColor: 'rgba(22, 163, 74, 0.2)',
        borderColor: 'rgba(22, 163, 74, 1)',
        borderWidth: 2,
      },
      {
        label: awayName,
        data: [efficiencyScores.away, offensiveScores.away, defensiveScores.away, htScores.away, ftScores.away],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        pointLabels: { font: { size: 10 } },
        ticks: { display: true, stepSize: 20 } // Mostra a escala de 0 a 100
      }
    },
    plugins: { legend: { position: 'top' as const } }
  };

  return (
    <div>
        <h4 className="font-bold text-gray-800 mb-2 text-center">Análise de Performance</h4>
        <div style={{ height: '250px' }}>
            <Radar data={data} options={options} />
        </div>
    </div>
  );
};
