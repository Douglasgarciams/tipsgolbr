// src/app/page.js --- VERSÃO FINAL SIMPLIFICADA

import Header from '@/components/Header';
import prisma from '@/lib/prisma';
import PalpitesClientView from '@/components/PalpitesClientView';

export default async function HomePage() {
  // 1. Busca todos os palpites no servidor (rápido e eficiente)
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
      </div>

      {/* 2. Entrega todos os palpites para o componente de cliente, que cuidará da interatividade */}
      <PalpitesClientView palpites={palpites} />
    </main>
  );
}