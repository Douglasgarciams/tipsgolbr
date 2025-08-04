'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler, // Importar o Filler para o gradiente
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Ícones para os cards de KPI (opcional, mas recomendado)
// Instale com: npm install lucide-react
import { Wallet, TrendingUp, CircleDollarSign, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  Filler // Registrar o Filler
);

// --- COMPONENTES AUXILIARES PARA UM CÓDIGO MAIS LIMPO ---

// Card para exibir um KPI
const KpiCard = ({ title, value, icon, formatAsCurrency = false, className = '' }) => {
  const FormattedIcon = icon;
  const formattedValue = formatAsCurrency 
    ? `R$ ${parseFloat(value).toFixed(2)}`
    : `${parseFloat(value).toFixed(2)}%`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${className}`}>
        <FormattedIcon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{formattedValue}</p>
      </div>
    </div>
  );
};

// Wrapper para os gráficos
const ChartCard = ({ title, children }) => (
  <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
    <div className="h-96">{children}</div>
  </section>
);


// --- COMPONENTE PRINCIPAL ---

export default function AnaliseResultados() {
  // Estado mais robusto para lidar com carregamento e erro
  const [chartData, setChartData] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    fetch('/api/user-apostas')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Falha ao buscar os dados da API.');
        }
        return res.json();
      })
      .then((data) => {
        setChartData({ loading: false, error: null, data: data });
      })
      .catch((err) => {
        setChartData({ loading: false, error: err.message, data: null });
      });
  }, []);

  // --- ESTADOS DE CARREGAMENTO E ERRO ---

  if (chartData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Carregando análise de performance...</p>
        </div>
      </div>
    );
  }

  if (chartData.error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center text-red-700">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-xl shadow-md border border-red-200">
           <AlertCircle className="h-8 w-8 text-red-500" />
           <div>
             <h2 className="text-lg font-bold">Ocorreu um Erro</h2>
             <p className="text-red-600">{chartData.error}</p>
           </div>
        </div>
      </div>
    );
  }

  // Desestruturação dos dados para facilitar o uso
  const { resultadosPorMetodo, apostas, resumoPNL } = chartData.data;

  // --- PREPARAÇÃO DOS DADOS PARA OS GRÁFICOS ---

  // Paleta de cores profissional e moderna
  const professionalColors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f97316', // orange-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
  ];
  const professionalBgColors = [
    'rgba(59, 130, 246, 0.2)',
    'rgba(16, 185, 129, 0.2)',
    'rgba(249, 115, 22, 0.2)',
    'rgba(139, 92, 246, 0.2)',
    'rgba(236, 72, 153, 0.2)',
    'rgba(245, 158, 11, 0.2)',
  ];

  // Gráfico de Linha: Evolução do Saldo
  const sortedBets = [...apostas].reverse();
  let accumulatedBalance = 0;
  const lineLabels = sortedBets.map(aposta => new Date(aposta.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
  const lineData = sortedBets.map(aposta => {
    accumulatedBalance += aposta.resultadoPNL || 0;
    return accumulatedBalance.toFixed(2);
  });
  
  // Gráficos de Barra: Saldo e ROI por Método
  const methodLabels = resultadosPorMetodo.map(m => m.metodo);
  const balanceData = resultadosPorMetodo.map(m => m.saldoFinal);
  const roiData = resultadosPorMetodo.map(m => m.roi);

  // --- OPÇÕES GERAIS PARA OS GRÁFICOS (DRY) ---
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4b5563', // gray-600
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937', // gray-800
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb', // gray-200
        padding: 12,
        cornerRadius: 8,
        boxPadding: 4,
        titleFont: { weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Adiciona R$ ou % dependendo do gráfico
              if (context.dataset.label.includes('Saldo')) {
                 label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
              } else {
                 label += `${context.parsed.y.toFixed(2)}%`;
              }
            }
            return label;
          }
        }
      },
      datalabels: { // Desabilitar por padrão, pode ser habilitado por gráfico
          display: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#4b5563', maxRotation: 45, minRotation: 30, autoSkip: true, maxTicksLimit: 15 },
        grid: { color: 'rgba(0,0,0,0.03)' }
      },
      y: {
        ticks: { color: '#4b5563' },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard de Performance</h1>
          <p className="text-gray-500 mt-1">Análise detalhada dos seus resultados em apostas.</p>
        </header>

        {/* --- SEÇÃO DE KPIs --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <KpiCard 
                title="Saldo Final Total" 
                value={resumoPNL.saldoFinal} 
                icon={Wallet} 
                formatAsCurrency={true}
                className={resumoPNL.saldoFinal >= 0 ? 'bg-green-500' : 'bg-red-500'}
            />
            <KpiCard 
                title="ROI Geral" 
                value={resumoPNL.roi} 
                icon={TrendingUp} 
                className="bg-blue-500"
            />
            <KpiCard 
                title="Total Investido" 
                value={resumoPNL.totalApostado} 
                icon={CircleDollarSign} 
                formatAsCurrency={true}
                className="bg-amber-500"
            />
        </section>

        {/* --- LAYOUT DE GRÁFICOS EM GRID --- */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Gráfico de Linha ocupando a largura total em telas grandes */}
          <div className="lg:col-span-2">
            <ChartCard title="📉 Evolução do Saldo Acumulado">
              <Line
                data={{
                  labels: lineLabels,
                  datasets: [{
                    label: 'Saldo Acumulado',
                    data: lineData,
                    borderColor: '#059669', // green-600
                    backgroundColor: (context) => {
                       const ctx = context.chart.ctx;
                       const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                       gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                       gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                       return gradient;
                    },
                    tension: 0.3,
                    pointRadius: 2,
                    pointBackgroundColor: '#059669',
                    fill: true, // Habilita o preenchimento com gradiente
                  }],
                }}
                options={{
                  ...commonChartOptions,
                  scales: { ...commonChartOptions.scales, y: { ...commonChartOptions.scales.y, beginAtZero: false } }
                }}
              />
            </ChartCard>
          </div>

          {/* NOVO: Gráfico de ROI por Método (Barras Horizontais) */}
          <ChartCard title="📊 ROI por Método (%)">
             <Bar 
               data={{
                  labels: methodLabels,
                  datasets: [{
                    label: 'ROI',
                    data: roiData,
                    backgroundColor: professionalColors,
                    borderColor: professionalColors,
                    borderWidth: 1,
                  }]
               }}
               options={{
                ...commonChartOptions,
                indexAxis: 'y', // ESSA É A LINHA QUE TRANSFORMA EM BARRAS HORIZONTAIS
                plugins: {
                  ...commonChartOptions.plugins,
                  datalabels: { // Habilitar datalabels para este gráfico
                    display: true,
                    color: '#1f2937',
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold' },
                    formatter: (value) => `${value.toFixed(1)}%`,
                  }
                }
               }}
             />
          </ChartCard>
          
          {/* Gráfico de Saldo por Método (Barras Verticais) */}
          <ChartCard title="💰 Saldo Final por Método">
            <Bar
              data={{
                labels: methodLabels,
                datasets: [{
                  label: 'Saldo Final',
                  data: balanceData,
                  backgroundColor: professionalBgColors,
                  borderColor: professionalColors,
                  borderWidth: 2,
                  borderRadius: 5,
                }],
              }}
              options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  datalabels: { // Habilitar datalabels
                    display: true,
                    color: '#4b5563',
                    anchor: 'end',
                    align: 'top',
                    font: { weight: 'bold' },
                    formatter: (value) => `R$ ${value.toFixed(0)}`,
                  }
                },
                scales: { ...commonChartOptions.scales, y: { ...commonChartOptions.scales.y, beginAtZero: true } }
              }}
            />
          </ChartCard>

        </main>
      </div>
    </div>
  );
}