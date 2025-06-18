// src/components/PalpiteCard.js
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PalpiteCard({ palpiteInfo }) {
  // Formata a data para "16/06 às 20:00h"
  const dataFormatada = format(new Date(palpiteInfo.dataHora), "dd/MM 'às' HH:mm'h'", {
    locale: ptBR,
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg text-white flex flex-col transition-transform hover:scale-105">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-cyan-400">{palpiteInfo.competicao}</span>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{palpiteInfo.esporte}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{palpiteInfo.jogo}</h3>
      <p className="text-gray-300 mb-1">📅 {dataFormatada}</p>
      <p className="text-gray-300 mb-4 flex-grow">
        <span className="font-semibold text-white">Nosso Palpite:</span> {palpiteInfo.palpite}
      </p>
      <a
        href={palpiteInfo.link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Ver Palpite
      </a>
    </div>
  );
}