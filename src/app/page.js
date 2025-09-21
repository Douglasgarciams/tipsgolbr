// src/app/page.js --- VERSÃO FINAL COM BOTÕES DE NAVEGAÇÃO

import Header from '@/components/Header';
import prisma from '@/lib/prisma';
import PalpitesClientView from '@/components/PalpitesClientView';
import Link from 'next/link';

export default async function HomePage() {
  const palpites = await prisma.palpite.findMany({
    orderBy: {
      dataHora: 'asc',
    },
  });

  return (
    <main className="min-h-screen bg-gray-900 text-white container mx-auto p-4 md:p-8">
      <div className="text-center my-8">
        <Header />
        <p className="text-gray-400 mt-2 text-lg">
          Sua seleção diária de palpites de futebol.
        </p>

        {/* Botões de Navegação */}
        <div className="mt-6 flex justify-center gap-4"> {/* Centraliza e adiciona espaço entre botões */}
          <Link
            href="/meus-resultados"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors shadow-lg"
          >
            Meus Resultados
          </Link>
          {/* NOVO: Botão para Aulas */}
          <Link
            href="/aulas"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-colors shadow-lg"
          >
            Aulas
          </Link>
          {/* NOVO: Botão para a Calculadora Back/Lay */}
          <Link
            href="/calculadora"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors shadow-lg"
          >
            Calculadora
            </Link>

            {/* NOVO: Botão para grafico de resultados*/}
            <Link
            href="/analise-resultados"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-md transition-colors shadow-lg"
          >
            Planilha/Grafico
            </Link>
        </div>

      </div>

      <PalpitesClientView palpites={palpites} />
    </main>
  );
}