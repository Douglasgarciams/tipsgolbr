// src/components/PalpiteCard.js --- VERSÃO COM ANÁLISE EXPANSÍVEL

"use client"; // ESSENCIAL para usar o useState e criar interatividade

import { useState } from 'react';

// As funções helper que já tínhamos
const formatarDataHora = (data) => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
  });
};

const ConfidenceStars = ({ level }) => {
  if (!level || level < 1 || level > 5) return null;
  const stars = '★'.repeat(level) + '☆'.repeat(5 - level);
  return <span className="text-sm text-amber-400" title={`${level} de 5`}>{stars}</span>;
};

const ResultadoIcon = ({ resultado }) => {
  if (resultado === 'GREEN') return <span title="Green" className="text-xl">✅</span>;
  if (resultado === 'RED') return <span title="Red" className="text-xl">❌</span>;
  return <span title="Pendente">⏳</span>;
};

export default function PalpiteCard({ palpite }) {
  // Novo estado para controlar se a análise está aberta ou fechada
  const [analiseAberta, setAnaliseAberta] = useState(false);

  return (
    <div className="flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full border border-gray-700 hover:border-green-500 transition-all">
      {/* Cabeçalho do Card */}
      <div className="p-3 flex justify-between items-center bg-gray-700/50">
        <span className="text-sm font-semibold text-cyan-400 truncate">{palpite.competicao}</span>
        <span className="text-xs text-gray-400 whitespace-nowrap">{formatarDataHora(palpite.dataHora)}</span>
      </div>
      
      {/* Corpo do Card */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-center mb-3">
          <p className="font-bold text-lg text-white leading-tight">
            {palpite.jogo} {palpite.placar && `(${palpite.placar})`}
         </p>
        </div>

        <div className="text-center bg-gray-900 rounded-lg p-3 my-2">
          <p className="text-xl font-bold text-green-400">{palpite.palpite}</p>
          {palpite.odds && 
            <p className="text-sm font-semibold text-white mt-1">
              Odd: {palpite.odds.toFixed(2)}
            </p>
          }
        </div>
        
        <div className="flex-grow"></div> 
      </div>

      {/* Análise do especialista (só aparece se existir) */}
      {palpite.analise && (
        <div className="px-4 pb-4">
          <button 
            onClick={() => setAnaliseAberta(!analiseAberta)}
            className="text-sm text-cyan-400 hover:text-cyan-300 w-full text-left flex items-center transition-colors"
          >
            {/* A setinha que gira */}
            <span className={`transform transition-transform duration-200 ${analiseAberta ? 'rotate-90' : ''}`}>▶</span>
            <span className="ml-2 font-bold">Análise completa - click aqui</span>
          </button>
          
          {/* O conteúdo da análise que só aparece se 'analiseAberta' for true */}
          {analiseAberta && (
            <div className="mt-2 text-sm text-gray-300 bg-gray-700 p-3 rounded-md">
              <p className="italic">{`"${palpite.analise}"`}</p>
            </div>
          )}
        </div>
      )}

      {/* Rodapé do Card */}
      <div className="bg-gray-700/50 p-3 flex justify-between items-center mt-auto">
        <div>
          {palpite.confianca && (
            <>
              <span className="text-sm font-bold text-gray-300">Confiança: </span>
              <ConfidenceStars level={palpite.confianca} />
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-300">Resultado:</span>
          <ResultadoIcon resultado={palpite.resultado} />
        </div>
      </div>
      
      {/* Botão de Ação */}
      <a href={palpite.link} target="_blank" rel="noopener noreferrer" className="block bg-green-600 hover:bg-green-700 text-white font-bold text-center py-3 transition-colors">
        Apostar Agora
      </a>
    </div>
  );
}