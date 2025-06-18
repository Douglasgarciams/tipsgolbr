// src/app/page.js --- VERSÃO NOVA E DINÂMICA

import PalpiteCard from "@/components/PalpiteCard";
import Header from '@/components/Header';

// Esta função busca os dados da nossa própria API
async function getPalpites() {
  // A URL é a do nosso endpoint que acabamos de fazer funcionar
  // O { cache: 'no-store' } garante que os dados sejam sempre os mais recentes
  const res = await fetch('http://localhost:3000/api/palpites', { cache: 'no-store' });

  if (!res.ok) {
    // Se a API der um erro, ele será mostrado no terminal
    throw new Error('Falha ao buscar dados da API');
  }

  return res.json();
}

// A página agora é uma função "async", capaz de esperar por dados
export default async function HomePage() {
  // Aqui, a página chama a função, espera a resposta da API e guarda em uma variável
  const palpitesDoDia = await getPalpites();

  return (
    // VERSÃO CORRIGIDA
<main className="min-h-screen bg-gray-900 text-white container mx-auto p-4 md:p-8">
      
      <div className="text-center my-8">
        <Header />
        <p className="text-gray-400 mt-2 text-lg">
    Sua seleção diária de palpites de futebol.
        </p>
      </div>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-green-500 pl-4">
          Palpites do Dia
        </h2>
        
        {/* Adicionamos uma verificação aqui: */}
        {palpitesDoDia.length > 0 ? (
          // Se houver palpites, mostra os cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {palpitesDoDia.map((palpite) => (
              <PalpiteCard key={palpite.id} palpiteInfo={palpite} />
            ))}
          </div>
        ) : (
          // Se não houver palpites, mostra uma mensagem
          <p className="text-gray-400 text-center">Nenhum palpite disponível no momento.</p>
        )}
      </section>

      <footer className="text-center text-gray-500 mt-12 py-4">
        <p>&copy; {new Date().getFullYear()} TipsGolBR. Jogue com responsabilidade.</p>
      </footer>

    </main>
  );
}