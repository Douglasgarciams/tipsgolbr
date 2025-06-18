// src/app/page.js --- VERSÃO COM AGRUPAMENTO POR DATA

import Header from '@/components/Header';
import PalpiteCard from '@/components/PalpiteCard';
import prisma from '@/lib/prisma';

// Função que pega a lista de palpites e a separa em grupos
const agruparPalpites = (palpites) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const depoisDeAmanha = new Date(hoje);
  depoisDeAmanha.setDate(hoje.getDate() + 2);

  const grupos = {
    hoje: [],
    amanha: [],
    proximosDias: [],
    resultados: [],
  };

  palpites.forEach(p => {
    const dataPalpite = new Date(p.dataHora);
    // Usamos >= hoje para garantir que jogos que já aconteceram hoje apareçam em resultados
    if (dataPalpite < hoje) {
      grupos.resultados.push(p);
    } else if (dataPalpite >= hoje && dataPalpite < amanha) {
      grupos.hoje.push(p);
    } else if (dataPalpite >= amanha && dataPalpite < depoisDeAmanha) {
      grupos.amanha.push(p);
    } else {
      grupos.proximosDias.push(p);
    }
  });

  // Ordena os resultados dos mais recentes para os mais antigos
  grupos.resultados.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  return grupos;
};


// Componente auxiliar para renderizar uma seção de palpites, para não repetir código
const PalpiteSection = ({ titulo, palpitesDoGrupo }) => {
  if (palpitesDoGrupo.length === 0) return null; // Não mostra a seção se estiver vazia

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white border-l-4 border-green-500 pl-4 mb-6">
        {titulo}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {palpitesDoGrupo.map(palpite => (
          <PalpiteCard key={palpite.id} palpite={palpite} />
        ))}
      </div>
    </section>
  );
};

export default async function HomePage() {
  // Busca os palpites do banco de dados
  const palpites = await prisma.palpite.findMany({
    orderBy: {
      dataHora: 'asc', // Ordena por data do mais próximo ao mais distante
    },
  });

  const palpitesAgrupados = agruparPalpites(palpites);

  return (
    <main className="min-h-screen bg-gray-900 text-white container mx-auto p-4 md:p-8">
      <div className="text-center my-8">
        <Header />
        <p className="text-gray-400 mt-2 text-lg">
          Sua seleção diária de palpites de futebol.
        </p>
      </div>

      {palpites.length === 0 ? (
        <p className="text-center text-gray-400 text-xl">Nenhum palpite disponível no momento.</p>
      ) : (
        <div>
          <PalpiteSection titulo="Jogos de Hoje" palpitesDoGrupo={palpitesAgrupados.hoje} />
          <PalpiteSection titulo="Jogos de Amanhã" palpitesDoGrupo={palpitesAgrupados.amanha} />
          <PalpiteSection titulo="Próximos Dias" palpitesDoGrupo={palpitesAgrupados.proximosDias} />
          <PalpiteSection titulo="Resultados Recentes" palpitesDoGrupo={palpitesAgrupados.resultados} />
        </div>
      )}
    </main>
  );
}