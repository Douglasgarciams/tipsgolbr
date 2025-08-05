// src/components/CalendarioPerformance.jsx

'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

// --- COMPONENTE DO MODAL DE DETALHES ---
const ModalDetalhesAposta = ({ dia, apostasDoDia, onClose }) => {
  if (!apostasDoDia) return null;

  const dataFormatada = new Date(dia).toLocaleDateString('pt-BR', {
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
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
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
                  {aposta.resultadoPNL >= 0 ? '+' : ''}R$ {aposta.resultadoPNL.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Odd: {aposta.odd} | Stake: R$ {aposta.stake.toFixed(2)}
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


// --- COMPONENTE PRINCIPAL DO CALENDÁRIO ---
export default function CalendarioPerformance({ apostas }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // 1. PROCESSAMENTO DOS DADOS
  // useMemo garante que este cálculo pesado só roda quando as 'apostas' mudam.
  const dadosPorDia = useMemo(() => {
    if (!apostas) return {};
    
    return apostas.reduce((acc, aposta) => {
      const dia = aposta.data.split('T')[0]; // Formato 'YYYY-MM-DD'

      if (!acc[dia]) {
        acc[dia] = {
          pnlTotal: 0,
          totalApostas: 0,
          apostas: [],
          // Supondo que você tenha a 'banca' no dia, ou um valor fixo.
          // Aqui usaremos o PNL para calcular o % de retorno sobre o investido (ROI) do dia.
          stakeTotal: 0,
        };
      }

      acc[dia].pnlTotal += aposta.resultadoPNL;
      acc[dia].stakeTotal += aposta.stake;
      acc[dia].totalApostas += 1;
      acc[dia].apostas.push(aposta);

      return acc;
    }, {});
  }, [apostas]);


  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleOpenModal = (dia) => {
    const dados = dadosPorDia[dia];
    if (dados && dados.totalApostas > 0) {
      setSelectedDay(dia);
    }
  };

  const handleCloseModal = () => {
    setSelectedDay(null);
  };


  // 2. LÓGICA DE GERAÇÃO DA GRADE DO CALENDÁRIO
  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth();

  const primeiroDiaDoMes = new Date(ano, mes, 1);
  const ultimoDiaDoMes = new Date(ano, mes + 1, 0);

  const diasNoMes = [];
  // Adiciona dias do mês anterior para preencher o início
  const diaDaSemanaInicio = primeiroDiaDoMes.getDay(); // 0 = Domingo, 1 = Segunda...
  for (let i = 0; i < diaDaSemanaInicio; i++) {
    diasNoMes.push({ key: `prev-${i}`, dia: null, isCurrentMonth: false });
  }

  // Adiciona os dias do mês atual
  for (let i = 1; i <= ultimoDiaDoMes.getDate(); i++) {
    const diaString = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    diasNoMes.push({ 
      key: diaString, 
      dia: i, 
      isCurrentMonth: true, 
      dados: dadosPorDia[diaString] 
    });
  }
  
  // Adiciona dias do próximo mês para preencher o final
  const diaDaSemanaFim = ultimoDiaDoMes.getDay();
  for (let i = 1; i < 7 - diaDaSemanaFim; i++) {
    diasNoMes.push({ key: `next-${i}`, dia: null, isCurrentMonth: false });
  }

  const nomeMes = currentDate.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
  const pnlMes = Object.values(dadosPorDia)
    .filter(d => d.apostas[0].data.startsWith(`${ano}-${String(mes + 1).padStart(2, '0')}`))
    .reduce((acc, d) => acc + d.pnlTotal, 0);


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">{nomeMes} / {ano}</h2>
        <div className="flex items-center gap-4">
           <span className={`font-bold text-2xl ${pnlMes >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            R$ {pnlMes.toFixed(2)}
           </span>
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} /></button>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20} /></button>
          <button className="p-2 rounded-full hover:bg-gray-100"><Download size={20} /></button>
        </div>
      </div>
      
      {/* Grid do Calendário */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
          <div key={d} className="font-semibold text-sm text-gray-500 py-2">{d}</div>
        ))}

        {diasNoMes.map(({ key, dia, isCurrentMonth, dados }) => (
          <div
            key={key}
            onClick={() => handleOpenModal(key)}
            className={`
              h-28 sm:h-32 p-2 border rounded-md flex flex-col justify-start items-start text-left
              ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
              ${dados ? 'cursor-pointer hover:border-gray-400' : ''}
              transition-all duration-200
            `}
          >
            {isCurrentMonth && (
              <>
                <span className="font-bold text-gray-600">{dia}</span>
                {dados && (
                  <div className={`mt-1 p-2 rounded-md w-full flex-grow ${dados.pnlTotal >= 0 ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                    <p className="font-bold text-lg">
                      {((dados.pnlTotal / dados.stakeTotal) * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs opacity-80">ROI do Dia</p>
                    <p className="text-xs opacity-80 mt-1">{dados.totalApostas} apostas</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      {selectedDay && (
        <ModalDetalhesAposta 
          dia={selectedDay}
          apostasDoDia={dadosPorDia[selectedDay]?.apostas}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}