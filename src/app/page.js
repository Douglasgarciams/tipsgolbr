// src/app/page.js --- VERSÃO FINAL SIMPLIFICADA COM BOTÃO "MEUS RESULTADOS" (CORRIGIDO)

import Header from '@/components/Header';
import prisma from '@/lib/prisma';
import PalpitesClientView from '@/components/PalpitesClientView';
import Link from 'next/link'; // Importe o componente Link

export default async function HomePage() {
  // 1. O Chefe (page.js) busca todos os palpites no servidor
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

        {/* NOVO: Botão para Meus Resultados (CORRIGIDO AQUI) */}
        <div className="mt-6"> {/* Adicione um espaçamento superior */}
          <Link 
            href="/meus-resultados"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors shadow-lg"
          >
            Ver Meus Resultados
          </Link>
        </div>
        
      </div>
      
      {/* 2. O Chefe entrega todos os palpites para o Garçom (PalpitesClientView), que cuidará da interatividade */}
      <PalpitesClientView palpites={palpites} />
    </main>
  );
}