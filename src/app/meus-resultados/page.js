"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormattedDate from '@/components/FormattedDate';
import Link from 'next/link';

const formatMetodoName = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export default function MeusResultadosPage() {
  const [apostas, setApostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumoPNL, setResumoPNL] = useState({ totalLucro: 0, totalPrejuizo: 0, saldoFinal: 0, roi: 0, totalApostado: 0 }); 
  const [resultadosPorMetodo, setResultadosPorMetodo] = useState([]);
  const router = useRouter();

  // Funções para buscar os dados (incluindo apostas deletadas para cálculo)
  const fetchUserApostas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user-apostas');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao buscar suas apostas.');
      }
      const data = await res.json();

      // Filtra as apostas para exibição (apenas as NÃO deletadas)
      const apostasNaoDeletadas = data.apostas.filter(a => !a.isDeleted);

      setApostas(apostasNaoDeletadas); // Exibe apenas as não deletadas
      setResumoPNL({ // Resumo PNL vem da API, que calcula sobre TUDO
        totalLucro: data.resumoPNL.totalLucro,
        totalPrejuizo: data.resumoPNL.totalPrejuizo,
        saldoFinal: data.resumoPNL.saldoFinal,
        roi: data.resumoPNL.roi,
        totalApostado: data.resumoPNL.totalApostado // Adiciona o totalApostado
      }); 
      setResultadosPorMetodo(data.resultadosPorMetodo); // Cálculos por método vêm da API, sobre TUDO

    } catch (err) {
      console.error("Erro ao buscar apostas do usuário:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApostas();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // NOVO: Função para realizar a soft delete de uma aposta
  const handleSoftDeleteAposta = async (apostaId) => {
    if (window.confirm('Tem certeza que deseja OCULTAR esta aposta da sua lista? Ela ainda contará para seus resultados gerais.')) {
      setLoading(true); // Pode ser bom mostrar um loading
      try {
        // Esta API será criada no próximo passo!
        const res = await fetch(`/api/apostas/${apostaId}/soft-delete`, { method: 'PUT' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Falha ao ocultar a aposta.');
        }
        // Sucesso: recarrega as apostas
        fetchUserApostas();
      } catch (error) {
        console.error("Erro ao ocultar aposta:", error);
        setError(error.message);
        setLoading(false); // Remove loading em caso de erro
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Carregando seus resultados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center flex-col">
        <p className="text-red-400">Erro: {error}</p>
        <button onClick={() => router.push('/login')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
          Ir para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Meus Resultados de Aposta</h1>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Ver Palpites
            </Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">
              Sair (Logout)
            </button>
          </div>
        </div>

        {/* Seção de Resumo PNL/ROI Geral */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Lucro (GREEN)</p>
            <p className="text-xl font-bold text-green-400">R$ {resumoPNL.totalLucro.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Prejuízo (RED)</p>
            <p className="text-xl font-bold text-red-400">R$ {Math.abs(resumoPNL.totalPrejuizo).toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Saldo Final</p>
            <p className={`text-xl font-bold ${resumoPNL.saldoFinal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {resumoPNL.saldoFinal.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">ROI</p>
            <p className={`text-xl font-bold ${resumoPNL.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {resumoPNL.roi.toFixed(2)}%
            </p>
          </div>
          {/* Campo para Total Apostado */}
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Apostado</p>
            <p className="text-xl font-bold text-white">R$ {(resumoPNL.totalApostado || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Seção de Resultados por Método */}
        {resultadosPorMetodo.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Resultados por Método</h2>
            <div className="space-y-4">
              {resultadosPorMetodo.map((resMetodo, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-md">
                  <h3 className="font-bold text-lg text-white mb-2">{resMetodo.metodo} ({resMetodo.count} apostas)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Lucro:</p>
                      <p className="font-bold text-green-400">R$ {resMetodo.totalLucro.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Prejuízo:</p>
                      <p className="font-bold text-red-400">R$ {Math.abs(resMetodo.totalPrejuizo).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Saldo:</p>
                      <p className={`font-bold ${resMetodo.saldoFinal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R$ {resMetodo.saldoFinal.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">ROI:</p>
                      <p className={`font-bold ${resMetodo.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {resMetodo.roi.toFixed(2)}%
                      </p>
                    </div>
                    {/* Campo para Total Apostado por Método */}
                    <div>
                      <p className="text-gray-400">Apostado:</p>
                      <p className="font-bold text-white">R$ {(resMetodo.totalApostado || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Apostas Registradas */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Minhas Apostas Registradas</h2>
          {apostas.length > 0 ? (
            <div className="space-y-4">
              {apostas.map((aposta) => (
                <div key={aposta.id} className="bg-gray-700 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <div>
                    {/* Usando os campos duplicados */}
                    <p className="font-bold">{aposta.palpiteJogo || 'Jogo Desconhecido'}</p>
                    <p className="text-sm text-gray-400">{aposta.palpiteMetodo ? formatMetodoName(aposta.palpiteMetodo) : 'Método Desconhecido'}</p>
                    {aposta.palpiteCompeticao && <p className="text-xs text-gray-500">Comp: {aposta.palpiteCompeticao}</p>}
                    {aposta.palpiteOdds && <p className="text-xs text-gray-500">Odd: {aposta.palpiteOdds.toFixed(2)}</p>}
                    {aposta.palpiteLink && <a href={aposta.palpiteLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">Link</a>}
                    <p className="text-xs text-gray-500">Registrado em: <FormattedDate isoDate={aposta.data} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Apostado: <span className="font-bold text-white">R$ {aposta.valorApostado.toFixed(2)}</span></p>
                    <p className={`text-sm font-semibold ${aposta.resultadoPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      PNL: R$ {aposta.resultadoPNL ? aposta.resultadoPNL.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="text-right">
                    {/* NOVO: Botão de Excluir individual da aposta */}
                    <button
                      onClick={() => handleSoftDeleteAposta(aposta.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Nenhuma aposta registrada ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}