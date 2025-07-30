// ARQUIVO: src/app/jogos-do-dia/BacktestAnalysisPanel.tsx
'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData,
    ChartDataset
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export const BacktestAnalysisPanel = ({ teamForm, teamId, teamName }) => {
    const strategyData = useMemo(() => {
        if (!teamForm || teamForm.length === 0) return null;

        const numGames = teamForm.length;
        let successCounts = {
            backTeam: 0,
            over0_5_ht: 0,
            over1_5_ft: 0,
            over2_5_ft: 0,
            over3_5_ft: 0,
            over4_5_ft: 0,
        };

        teamForm.forEach(game => {
            if (!game.teams || !game.goals || !game.score?.halftime) return;

            const isThisTeamHome = game.teams.home.id === teamId;
            const scored = isThisTeamHome ? game.goals.home : game.goals.away;
            const conceded = isThisTeamHome ? game.goals.away : game.goals.home;
            const htScored = isThisTeamHome ? game.score.halftime.home : game.score.halftime.away;
            const htConceded = isThisTeamHome ? game.score.halftime.away : game.score.halftime.home;
            const totalGoals = game.goals.home + game.goals.away;

            if (scored > conceded) successCounts.backTeam++;
            if ((htScored + htConceded) > 0.5) successCounts.over0_5_ht++;
            if (totalGoals > 1.5) successCounts.over1_5_ft++;
            if (totalGoals > 2.5) successCounts.over2_5_ft++;
            if (totalGoals > 3.5) successCounts.over3_5_ft++;
            if (totalGoals > 4.5) successCounts.over4_5_ft++;
        });

        const toPercent = (count) => (numGames > 0 ? (count / numGames) * 100 : 0);

        return {
            percentages: {
                backTeam: toPercent(successCounts.backTeam),
                over0_5_ht: toPercent(successCounts.over0_5_ht),
                over1_5_ft: toPercent(successCounts.over1_5_ft),
                over2_5_ft: toPercent(successCounts.over2_5_ft),
                over3_5_ft: toPercent(successCounts.over3_5_ft),
                over4_5_ft: toPercent(successCounts.over4_5_ft),
            },
            counts: successCounts,
            totalGames: numGames,
        };
    }, [teamForm, teamId]);

    const separatedSuccessRates = useMemo(() => {
        if (!teamForm || teamForm.length === 0) return null;

        const homeGames = teamForm.filter(game => game.teams.home.id === teamId);
        const awayGames = teamForm.filter(game => game.teams.away.id === teamId);

        const calculateRates = (games, isHome) => {
            const counts = {
                backTeam: 0,
                over0_5_ht: 0,
                over1_5_ft: 0,
                over2_5_ft: 0,
                over3_5_ft: 0,
                over4_5_ft: 0,
            };

            games.forEach(game => {
                if (!game.teams || !game.goals || !game.score?.halftime) return;

                const scored = isHome ? game.goals.home : game.goals.away;
                const conceded = isHome ? game.goals.away : game.goals.home;
                const htScored = isHome ? game.score.halftime.home : game.score.halftime.away;
                const htConceded = isHome ? game.score.halftime.away : game.score.halftime.home;
                const totalGoals = game.goals.home + game.goals.away;

                if (scored > conceded) counts.backTeam++;
                if ((htScored + htConceded) > 0.5) counts.over0_5_ht++;
                if (totalGoals > 1.5) counts.over1_5_ft++;
                if (totalGoals > 2.5) counts.over2_5_ft++;
                if (totalGoals > 3.5) counts.over3_5_ft++;
                if (totalGoals > 4.5) counts.over4_5_ft++;
            });

            const toPercent = (count, total) => (total > 0 ? (count / total) * 100 : 0);
            const numGames = games.length;

            return {
                percentages: {
                    backTeam: toPercent(counts.backTeam, numGames),
                    over0_5_ht: toPercent(counts.over0_5_ht, numGames),
                    over1_5_ft: toPercent(counts.over1_5_ft, numGames),
                    over2_5_ft: toPercent(counts.over2_5_ft, numGames),
                    over3_5_ft: toPercent(counts.over3_5_ft, numGames),
                    over4_5_ft: toPercent(counts.over4_5_ft, numGames),
                },
                counts,
                totalGames: numGames,
            };
        };

        return {
            home: calculateRates(homeGames, true),
            away: calculateRates(awayGames, false),
        };
    }, [teamForm, teamId]);

    if (!strategyData) return <p>Dados insuficientes para análise.</p>;

    const keys = ['backTeam', 'over0_5_ht', 'over1_5_ft', 'over2_5_ft', 'over3_5_ft', 'over4_5_ft'];
    const labels = ['Back', 'Over 0.5 HT', 'Over 1.5 FT', 'Over 2.5 FT', 'Over 3.5 FT', 'Over 4.5 FT'];

    const chartData: ChartData<'bar', number[], string> = {
        labels,
        datasets: [
            {
                label: `Aproveitamento para ${teamName} (%)`,
                data: keys.map(key => strategyData.percentages[key]),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                ],
                borderColor: [
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)',
                    'rgb(255, 159, 64)',
                    'rgb(153, 102, 255)',
                    'rgb(255, 99, 132)',
                ],
                borderWidth: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'end' as const,
                    formatter: (value, context) => {
                        const idx = context.dataIndex;
                        const count = strategyData.counts[keys[idx]];
                        return `${value.toFixed(0)}%\n(${count})`;
                    },
                    color: '#101418ff',
                    font: { weight: 'bold' },
                },
            } as ChartDataset<'bar', number[]>,
        ],
    };

    const chartOptions: ChartOptions<'bar'> = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            datalabels: { display: true },
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (value) => `${value}%` },
            },
        },
    };

    const separatedChartData: ChartData<'bar', number[], string> = {
        labels,
        datasets: [
            {
                label: 'Casa',
                data: keys.map(key => separatedSuccessRates.home.percentages[key]),
                backgroundColor: 'rgba(7, 146, 238, 0.6)',
                borderColor: 'rgba(1, 54, 54, 1)',
                borderWidth: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'end' as const,
                    formatter: (value, context) => {
                        const idx = context.dataIndex;
                        const count = separatedSuccessRates.home.counts[keys[idx]];
                        return `${value.toFixed(0)}%\n(${count})`;
                    },
                    color: '#080a0cff',
                    font: { weight: 'bold' },
                },
            } as ChartDataset<'bar', number[]>,
            {
                label: 'Fora',
                data: keys.map(key => separatedSuccessRates.away.percentages[key]),
                backgroundColor: 'rgba(238, 30, 30, 0.6)',
                borderColor: 'rgba(224, 10, 56, 1)',
                borderWidth: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'end' as const,
                    formatter: (value, context) => {
                        const idx = context.dataIndex;
                        const count = separatedSuccessRates.away.counts[keys[idx]];
                        return `${value.toFixed(0)}%\n(${count})`;
                    },
                    color: '#080a0cff',
                    font: { weight: 'bold' },
                },
            } as ChartDataset<'bar', number[]>,
        ],
    };

    const separatedChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
            datalabels: { display: true },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (value) => `${value}%` },
            },
        },
    };

    return (
        <>
            <div className="h-75 relative">
                <h4 className="font-bold text-center text-gray-800 mb-2 text-sm">
                    Aproveitamento de Mercados Geral - 10 jogos({teamName})
                </h4>
                <Bar options={chartOptions} data={chartData} />
            </div>

            {separatedSuccessRates && (
                <div className="h-75 relative mt-4">
                    <h4 className="font-bold text-center text-gray-800 mb-0 text-sm">
                        Casa vs Fora - 5 jogos({teamName})
                    </h4>
                    <Bar options={separatedChartOptions} data={separatedChartData} />
                </div>
            )}
        </>
    );
};
