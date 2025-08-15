'use client';

// Imports do React e Gráficos
import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Imports de Ícones
import { Wallet, TrendingUp, CircleDollarSign, AlertCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  Filler
);

// --- Componente do Menu de Navegação ---
const NavigationMenu = () => {
  const pathname = usePathname(); // Hook para saber a URL atual

  const links = [
    { href: "/meus-resultados", label: "Meus Resultados", color: "bg-green-600 hover:bg-green-700" },
    { href: "/aulas", label: "Aulas", color: "bg-purple-600 hover:bg-purple-700" },
    { href: "/calculadora", label: "Calculadora", color: "bg-blue-600 hover:bg-blue-700" },
    { href: "/jogos-do-dia", label: "Análise Jogos", color: "bg-sky-600 hover:bg-sky-700" },
    { href: "/scanner", label: "Scanner", color: "bg-red-600 hover:bg-red-700" },
  ];

  return (
    <nav className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                inline-block text-white font-bold py-2 px-5 rounded-md transition-colors shadow-md
                ${link.color} 
                ${isActive ? 'ring-2 ring-offset-2 ring-yellow-400' : 'hover:scale-105'}
              `}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};


// --- Componente do Modal de Detalhes (para o Calendário) ---
const ModalDetalhesAposta = ({ dia, apostasDoDia, onClose }) => {
  if (!apostasDoDia) return null;

  const dataFormatada = new Date(`${dia}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800">Apostas de {dataFormatada}</h2>
        <ul className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
          {apostasDoDia.map((aposta) => (
            <li 
              key={aposta.id} 
              className={`p-3 rounded-md border-l-4 ${aposta.resultadoPNL >= 0 ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">{aposta.descricao || `Aposta #${aposta.id}`}</span>
                <span className={`font-bold ${aposta.resultadoPNL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {aposta.resultadoPNL >= 0 ? '+' : ''}R$ {parseFloat(aposta.resultadoPNL).toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Odd: {aposta.odd} | Stake: R$ {aposta.stake ? parseFloat(aposta.stake).toFixed(2) : '0.00'}
              </div>
            </li>
          ))}
        </ul>
        <button 
          onClick={onClose}
          className="mt-6 w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

// --- Card para exibir um KPI ---
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

// --- Wrapper para os gráficos ---
const ChartCard = ({ title, children }) => (
  <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
    <div className="h-96">{children}</div>
  </section>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function AnaliseResultados() {
  const [chartData, setChartData] = useState({ loading: true, error: null, data: null });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetch('/api/user-apostas')
      .then((res) => { if (!res.ok) throw new Error('Falha ao buscar os dados da API.'); return res.json(); })
      .then((data) => setChartData({ loading: false, error: null, data: data }))
      .catch((err) => setChartData({ loading: false, error: err.message, data: null }));
  }, []);

  const dadosPorDia = useMemo(() => {
    const apostas = chartData.data?.apostas;
    if (!apostas) return {};

    return apostas.reduce((acc, aposta) => {
      const dataLocal = new Date(aposta.data);
      const ano = dataLocal.getFullYear();
      const mes = String(dataLocal.getMonth() + 1).padStart(2, '0');
      const diaNum = String(dataLocal.getDate()).padStart(2, '0');
      const dia = `${ano}-${mes}-${diaNum}`;

      if (!acc[dia]) { acc[dia] = { pnlTotal: 0, totalApostas: 0, apostas: [], stakeTotal: 0 }; }
      
      acc[dia].pnlTotal += parseFloat(aposta.resultadoPNL || 0);
      acc[dia].stakeTotal += parseFloat(aposta.stake || 0);
      
      acc[dia].totalApostas += 1;
      acc[dia].apostas.push(aposta);
      return acc;
    }, {});
  }, [chartData.data]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleOpenModal = (dia) => { if (dadosPorDia[dia] && dadosPorDia[dia].totalApostas > 0) setSelectedDay(dia); };
  const handleCloseModal = () => setSelectedDay(null);

  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth();
  const nomeMes = currentDate.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();

  const diasNoMes = useMemo(() => {
    const primeiroDiaDoMes = new Date(ano, mes, 1);
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0);
    const grade = [];
    const diaDaSemanaInicio = primeiroDiaDoMes.getDay();
    for (let i = 0; i < diaDaSemanaInicio; i++) grade.push({ key: `prev-${i}`, dia: null, isCurrentMonth: false });
    for (let i = 1; i <= ultimoDiaDoMes.getDate(); i++) {
      const diaString = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      grade.push({ key: diaString, dia: i, isCurrentMonth: true, dados: dadosPorDia[diaString] });
    }
    const diaDaSemanaFim = ultimoDiaDoMes.getDay();
    for (let i = 1; i < 7 - diaDaSemanaFim; i++) grade.push({ key: `next-${i}`, dia: null, isCurrentMonth: false });
    return grade;
  }, [ano, mes, dadosPorDia]);

  const pnlMes = useMemo(() => Object.keys(dadosPorDia)
    .filter(key => key.startsWith(`${ano}-${String(mes + 1).padStart(2, '0')}`))
    .reduce((acc, key) => acc + dadosPorDia[key].pnlTotal, 0), [ano, mes, dadosPorDia]);

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
          <div><h2 className="text-lg font-bold">Ocorreu um Erro</h2><p className="text-red-600">{chartData.error}</p></div>
        </div>
      </div>
    );
  }

  const { resultadosPorMetodo, apostas, resumoPNL } = chartData.data;

  const professionalColors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b'];
  const professionalBgColors = ['rgba(59, 130, 246, 0.2)', 'rgba(16, 185, 129, 0.2)', 'rgba(249, 115, 22, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)', 'rgba(245, 158, 11, 0.2)'];
  const sortedBets = [...apostas].reverse();
  let accumulatedBalance = 0;
  const lineLabels = sortedBets.map(aposta => new Date(aposta.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
  const lineData = sortedBets.map(aposta => { accumulatedBalance += parseFloat(aposta.resultadoPNL || 0); return accumulatedBalance.toFixed(2); });
  const methodLabels = resultadosPorMetodo.map(m => m.metodo);
  const balanceData = resultadosPorMetodo.map(m => m.saldoFinal);
  const roiData = resultadosPorMetodo.map(m => m.roi);

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4b5563',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
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
      datalabels: {
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
        
        <NavigationMenu />
        
        <header>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard de Performance</h1>
          <p className="text-gray-500 mt-1">Análise detalhada dos seus resultados em apostas.</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCard title="Saldo Final Total" value={resumoPNL.saldoFinal} icon={Wallet} formatAsCurrency={true} className={resumoPNL.saldoFinal >= 0 ? 'bg-green-500' : 'bg-red-500'} />
          <KpiCard title="ROI Geral" value={resumoPNL.roi} icon={TrendingUp} className="bg-blue-500" />
          <KpiCard title="Total Investido" value={resumoPNL.totalApostado} icon={CircleDollarSign} formatAsCurrency={true} className="bg-amber-500" />
        </section>

        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">{nomeMes} / {ano}</h2>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={`font-bold text-lg sm:text-2xl ${pnlMes >= 0 ? 'text-green-600' : 'text-red-500'}`}>R$ {pnlMes.toFixed(2)}</span>
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} /></button>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20} /></button>
              <button className="p-2 rounded-full hover:bg-gray-100 hidden sm:block"><Download size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, index) => (<div key={`${d}-${index}`} className="font-semibold text-xs sm:text-sm text-gray-500 py-2">{d}</div>))}
            {diasNoMes.map(({ key, dia, isCurrentMonth, dados }) => (
              <div key={key} onClick={() => handleOpenModal(key)} className={`h-28 sm:h-32 p-1 sm:p-2 border rounded-md flex flex-col text-left ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${dados ? 'cursor-pointer hover:border-gray-400' : ''} transition-all duration-200`}>
                {isCurrentMonth && (<>
                  <span className="font-bold text-gray-600 text-sm">{dia}</span>
                  {dados && (
                    <div className={`mt-1 p-2 rounded-md w-full flex-grow flex flex-col justify-center ${dados.pnlTotal >= 0 ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                      
                      {dados.stakeTotal > 0 ? (
                        <>
                          <p className="font-bold text-base sm:text-lg leading-tight">{`${((dados.pnlTotal / dados.stakeTotal) * 100).toFixed(1)}%`}</p>
                          <p className="text-xs opacity-80">ROI Dia</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-base sm:text-lg leading-tight">{dados.pnlTotal > 0 ? 'LUCRO' : 'PERDA'}</p>
                          <p className="text-xs opacity-80">Aposta Grátis</p>
                        </>
                      )}
                      
                      <p className="text-xs opacity-80 mt-1">{dados.totalApostas} {dados.totalApostas > 1 ? 'apostas' : 'aposta'}</p>
                    </div>
                  )}
                </>)}
              </div>
            ))}
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <ChartCard title="📉 Evolução do Saldo Acumulado">
              <Line
                data={{
                  labels: lineLabels,
                  datasets: [{
                    label: 'Saldo Acumulado',
                    data: lineData,
                    borderColor: '#059669',
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
                    fill: true,
                  }],
                }}
                options={{
                  ...commonChartOptions,
                  scales: { ...commonChartOptions.scales, y: { ...commonChartOptions.scales.y, beginAtZero: false } }
                }}
              />
            </ChartCard>
          </div>
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
                indexAxis: 'y',
                plugins: {
                  ...commonChartOptions.plugins,
                  datalabels: {
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
                  datalabels: {
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

      {selectedDay && <ModalDetalhesAposta dia={selectedDay} apostasDoDia={dadosPorDia[selectedDay]?.apostas} onClose={handleCloseModal} />}
    </div>
  );
}