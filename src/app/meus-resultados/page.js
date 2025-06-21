"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormattedDate from '@/components/FormattedDate';
import Link from 'next/link'; // Importe o componente Link

export default function MeusResultadosPage() {
  const [apostas, setApostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumoPNL, setResumoPNL] = useState({ totalLucro: 0, totalPrejuizo: 0, saldoFinal: 0, roi: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchUserApostas = async () => {
      try {
        const res = await fetch('/api/user-apostas');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Falha ao buscar suas apostas.');
        }
        const data = await res.json();
        setApostas(data.apostas);
        setResumoPNL(data.resumoPNL);
      } catch (err) {
        console.error("Erro ao buscar apostas do usuário:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserApostas();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
          <div className="flex gap-4"> {/* Agrupando os botões */}
            {/* CORRIGIDO AQUI: Removida a tag <a> e classes aplicadas diretamente ao Link */}
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

        {/* Seção de Resumo PNL/ROI */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        {/* Lista de Apostas Registradas */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Minhas Apostas Registradas</h2>
          {apostas.length > 0 ? (
            <div className="space-y-4">
              {apostas.map((aposta) => (
                <div key={aposta.id} className="bg-gray-700 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <div>
                    <p className="font-bold">{aposta.palpite?.jogo || 'Jogo Desconhecido'}</p>
                    <p className="text-sm text-gray-400">{aposta.palpite?.palpite || 'Palpite Desconhecido'}</p>
                    <p className="text-xs text-gray-500">Registrado em: <FormattedDate isoDate={aposta.data} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Apostado: <span className="font-bold text-white">R$ {aposta.valorApostado.toFixed(2)}</span></p>
                    <p className={`text-sm font-semibold ${aposta.resultadoPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      PNL: R$ {aposta.resultadoPNL ? aposta.resultadoPNL.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="text-right">
                    {/* Aqui você pode adicionar botões para editar/excluir aposta se desejar */}
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