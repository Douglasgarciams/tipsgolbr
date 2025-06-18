// src/components/PalpiteCard.js

// Uma função para formatar a data e hora de forma amigável
const formatarDataHora = (data) => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export default function PalpiteCard({ palpite }) {
  // Adicionamos um ícone de status baseado no resultado do palpite
  const statusIcon = palpite.resultado === 'GREEN' ? '✅' : palpite.resultado === 'RED' ? '❌' : '⏳';

  return (
    <a 
      href={palpite.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-cyan-400">{palpite.competicao}</span>
        <span className="text-xs text-gray-400">{formatarDataHora(palpite.dataHora)}</span>
      </div>
      <div className="text-center my-3">
        <p className="font-bold text-lg text-white">{palpite.jogo}</p>
      </div>
      <div className="text-center bg-gray-900 rounded-lg p-3">
        <p className="text-lg font-bold text-green-400">{palpite.palpite} <span className="text-white">{statusIcon}</span></p>
      </div>
    </a>
  );
}