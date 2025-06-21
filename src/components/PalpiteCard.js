"use client";

import { useState } from 'react';
import FormattedDate from '@/components/FormattedDate'; // Importamos nosso componente de data

const ResultadoIcon = ({ resultado }) => {
  if (resultado === 'GREEN') return <span title="Green" className="text-xl">✅</span>;
  if (resultado === 'RED') return <span title="Red" className="text-xl">❌</span>;
  return <span title="Pendente">⏳</span>;
};

export default function PalpiteCard({ palpite }) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal
  const [formDataAposta, setFormDataAposta] = useState({
    valorApostado: '', // Será a "Responsabilidade" (stake)
    resultadoAposta: '', // Para escolher GREEN/RED
    ganhoOuPerda: '', // Valor para GREEN ou RED
  });
  const [isLoadingAposta, setIsLoadingAposta] = useState(false);
  const [messageAposta, setMessageAposta] = useState('');

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormDataAposta({
      valorApostado: '',
      resultadoAposta: '',
      ganhoOuPerda: '',
    });
    setMessageAposta(''); // Limpa mensagens ao fechar
  };

  const handleChangeAposta = (e) => {
    const { id, value } = e.target;
    setFormDataAposta((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmitAposta = async (e) => {
    e.preventDefault();
    setIsLoadingAposta(true);
    setMessageAposta('');

    const { valorApostado, resultadoAposta, ganhoOuPerda } = formDataAposta;

    if (!valorApostado || !resultadoAposta || !ganhoOuPerda) {
      setMessageAposta('Por favor, preencha todos os campos.');
      setIsLoadingAposta(false);
      return;
    }

    let resultadoPNL = 0; // Lucro ou Prejuízo
    if (resultadoAposta === 'GREEN') {
      resultadoPNL = parseFloat(ganhoOuPerda); // Se for GREEN, o valor é o ganho
    } else if (resultadoAposta === 'RED') {
      // Se for RED, o valor é a perda, então deve ser negativo
      resultadoPNL = -parseFloat(ganhoOuPerda); 
    }

    const body = {
      palpiteId: palpite.id,
      valorApostado: parseFloat(valorApostado),
      resultadoPNL: resultadoPNL,
      // Você pode adicionar um campo 'resultadoReal' para armazenar GREEN/RED se quiser
      // resultadoReal: resultadoAposta, 
    };

    try {
      // Esta API precisa ser criada! (Ex: src/app/api/apostar-palpite/route.js)
      const res = await fetch('/api/apostar-palpite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao registrar a aposta.');
      }

      setMessageAposta('Aposta registrada com sucesso!');
      // TODO: Pode ser necessário atualizar o estado do PalpitesClientview para refletir a aposta
      handleCloseModal(); // Fecha o modal após o sucesso
    } catch (error) {
      setMessageAposta(`Erro: ${error.message}`);
    } finally {
      setIsLoadingAposta(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full border border-gray-700 hover:border-green-500 transition-all">
      <div className="p-3 flex justify-between items-center bg-gray-700/50">
        <span className="text-sm font-semibold text-cyan-400 truncate">{palpite.competicao}</span>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          <FormattedDate isoDate={palpite.dataHora} />
        </span>
      </div>

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

      <div className="bg-gray-700/50 p-3 flex justify-between items-center mt-auto">
        <div>
          {/* Este div está vazio após a remoção de "Confiança". Poderia ser removido se não for usado para nada mais. */}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-300">Resultado:</span>
          <ResultadoIcon resultado={palpite.resultado} />
        </div>
      </div>

      <a href={palpite.link} target="_blank" rel="noopener noreferrer" className="block bg-green-600 hover:bg-green-700 text-white font-bold text-center py-3 transition-colors">
        Apostar Agora
      </a>

      {/* NOVO: Botão para abrir o modal de registro de resultado */}
      <button
        onClick={handleOpenModal}
        className="block bg-blue-600 hover:bg-blue-700 text-white font-bold text-center py-3 transition-colors mt-2"
      >
        Registrar Resultado
      </button>

      {/* NOVO: Modal de Registro de Aposta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Registrar Resultado da Aposta</h3>
            <p className="text-sm text-gray-400 mb-4">
                Palpite: **{palpite.jogo}** - {palpite.palpite}
            </p>
            <form onSubmit={handleSubmitAposta} className="space-y-4">
              <div>
                <label htmlFor="valorApostado" className="block text-sm font-medium text-gray-300">
                  Responsabilidade (Valor da Aposta)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="valorApostado"
                  value={formDataAposta.valorApostado}
                  onChange={handleChangeAposta}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
                  placeholder="Ex: 10.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="resultadoAposta" className="block text-sm font-medium text-gray-300">
                  Resultado (GREEN/RED)
                </label>
                <select
                  id="resultadoAposta"
                  value={formDataAposta.resultadoAposta}
                  onChange={handleChangeAposta}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="GREEN">GREEN</option>
                  <option value="RED">RED</option>
                </select>
              </div>

              {formDataAposta.resultadoAposta && ( // Só mostra se um resultado for selecionado
                <div>
                  <label htmlFor="ganhoOuPerda" className="block text-sm font-medium text-gray-300">
                    {formDataAposta.resultadoAposta === 'GREEN' ? 'Valor Ganho (Ex: 8.50)' : 'Valor Perdido (Ex: 10.00)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="ganhoOuPerda"
                    value={formDataAposta.ganhoOuPerda}
                    onChange={handleChangeAposta}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
                    placeholder={formDataAposta.resultadoAposta === 'GREEN' ? '0.00 (somente o lucro)' : '0.00 (somente o valor da stake)'}
                    required
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoadingAposta}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
                >
                  {isLoadingAposta ? 'Registrando...' : 'Salvar Resultado'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </form>
            {messageAposta && <p className={`mt-4 text-center text-sm ${messageAposta.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>{messageAposta}</p>}
          </div>
        </div>
      )}
    </div>
  );
}