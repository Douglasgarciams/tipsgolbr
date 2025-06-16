import { palpitesDoDia } from "@/data/mockPalpites";
import PalpiteCard from "@/components/PalpiteCard";
// src/app/page.js

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      
      <header className="text-center my-8">
        <h1 className="text-5xl font-extrabold text-white">
          Tips<span className="text-green-500">Gol</span>BR
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Sua seleção diária de palpites de futebol.
        </p>
      </header>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-green-500 pl-4">
          Palpites do Dia
        </h2>
        
        {/* Grid que vai organizar os cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {palpitesDoDia.map((palpite) => (
    <PalpiteCard key={palpite.id} palpiteInfo={palpite} />
  ))}
</div>
      </section>

      <footer className="text-center text-gray-500 mt-12 py-4">
        <p>&copy; {new Date().getFullYear()} TipsGolBR. Jogue com responsabilidade.</p>
      </footer>

    </main>
  );
}