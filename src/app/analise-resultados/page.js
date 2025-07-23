'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function AnaliseResultados() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    fetch('/api/user-apostas')
      .then((res) => res.json())
      .then((data) => setDados(data));
  }, []);

  if (!dados) {
    return (
      <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center">
        <p className="text-lg font-medium animate-pulse">🔄 Carregando dados da análise...</p>
      </div>
    );
  }

  const metodos = dados.resultadosPorMetodo.map((m) => m.metodo);
  const saldos = dados.resultadosPorMetodo.map((m) => m.saldoFinal);
  const rois = dados.resultadosPorMetodo.map((m) => m.roi);
  const cores = metodos.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`);

  const apostasOrdenadas = [...dados.apostas].reverse();
  let saldoAcumulado = 0;
  const labelsLinha = [];
  const dataLinha = [];

  apostasOrdenadas.forEach((aposta, index) => {
    saldoAcumulado += aposta.resultadoPNL || 0;
    const data = new Date(aposta.data).toLocaleDateString();
    labelsLinha.push(data);
    dataLinha.push(saldoAcumulado.toFixed(2));
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Título Principal */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">📈 Análise Gráfica de Performance</h1>
          <p className="text-gray-500 text-base">Visualização clara e detalhada dos seus resultados</p>
        </header>

        {/* Saldo Acumulado - Linha */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📉 Evolução do Saldo Acumulado</h2>
          <Line
            data={{
              labels: labelsLinha,
              datasets: [
                {
                  label: 'Saldo Acumulado (R$)',
                  data: dataLinha,
                  borderColor: '#16a34a',
                  backgroundColor: 'rgba(22, 163, 74, 0.2)',
                  tension: 0.4,
                  pointRadius: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  backgroundColor: '#f3f4f6',
                  titleColor: '#111827',
                  bodyColor: '#111827',
                },
                legend: {
                  labels: {
                    color: '#111827',
                  },
                },
                datalabels: {
                  color: '#374151',
                  align: 'top',
                  anchor: 'end',
                  font: {
                    weight: 'bold',
                    size: 10,
                  },
                  formatter: (value) => `R$ ${value}`,
                },
              },
              scales: {
                x: {
                  display: true,
                  ticks: {
                    color: '#4b5563', // cinza escuro para tema claro
                    maxRotation: 45,
                    minRotation: 30,
                    autoSkip: true,
                    maxTicksLimit: 12,
                 },
                 grid: {
                   color: 'rgba(0,0,0,0.05)',
                 },
                },

                y: {
                  beginAtZero: false,
                  ticks: { color: '#4b5563' },
                  grid: { color: 'rgba(0,0,0,0.05)' },
                },
              },
            }}
          />
        </section>

        {/* Saldo por Método - Barras */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">💰 Saldo Final por Método</h2>
          <Bar
            data={{
              labels: metodos,
              datasets: [
                {
                  label: 'Saldo Final (R$)',
                  data: saldos,
                  backgroundColor: cores,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  backgroundColor: '#f3f4f6',
                  titleColor: '#111827',
                  bodyColor: '#111827',
                },
                legend: {
                  labels: {
                    color: '#111827',
                  },
                },
                datalabels: {
                  color: '#374151',
                  anchor: 'end',
                  align: 'top',
                  font: {
                    weight: 'bold',
                    size: 12,
                  },
                  formatter: (value) => `R$ ${value.toFixed(2)}`,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { color: '#4b5563' },
                  grid: { color: 'rgba(0,0,0,0.05)' },
                },
                x: {
                  ticks: { color: '#4b5563' },
                  grid: { color: 'rgba(0,0,0,0.02)' },
                },
              },
            }}
          />
        </section>

        {/* ROI - Pizza */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">📊 ROI por Método</h2>
          <div className="w-full h-96">
            <Pie
              data={{
                labels: metodos,
                datasets: [
                  {
                    label: 'ROI (%)',
                    data: rois,
                    backgroundColor: cores,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    backgroundColor: '#f3f4f6',
                    titleColor: '#111827',
                    bodyColor: '#111827',
                  },
                  legend: {
                    labels: {
                      color: '#111827',
                    },
                  },
                  datalabels: {
                    color: '#374151',
                    font: {
                      weight: 'bold',
                      size: 14,
                    },
                    formatter: (value) => `${value.toFixed(1)}%`,
                  },
                },
              }}
            />
          </div>
        </section>

        {/* Resumo Final */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-inner text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Resumo Geral</h3>
          <p className="text-base">
            Total Apostado:{' '}
            <span className="text-green-600 font-medium">R$ {dados.resumoPNL.totalApostado.toFixed(2)}</span> — Saldo Final:{' '}
            <span className={dados.resumoPNL.saldoFinal >= 0 ? 'text-green-600' : 'text-red-500'}>
              R$ {dados.resumoPNL.saldoFinal.toFixed(2)}
            </span>{' '}
            — ROI Geral: <span className="text-yellow-500 font-medium">{dados.resumoPNL.roi.toFixed(2)}%</span>
          </p>
        </section>
      </div>
    </div>
  );
}
