// src/app/aulas/page.js - COM LAYOUT DE 4 BLOCOS E SEM TEXTO DESCRITIVO (CORRIGIDO)

import Link from 'next/link';

export default function AulasPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Nossas Aulas</h1>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Voltar para Palpites
          </Link>
        </div>

        <p className="text-gray-300 mb-8">
          Aprenda os melhores métodos e estratégias para suas apostas.
        </p>

        {/* Contêiner para o Grid de Aulas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* Bloco de Aula 1 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">O que é Back ou lay, nas apostas esportivas</h2>

            <img
              src="/images/backoulay.png"
              alt="Exemplo do Método Lay 0x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/WjoRWrNZ8fA?si=_vrTbJbl_IaTYIaK"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>

          {/* Bloco de Aula 2 (Exemplo) */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Estratégias de BACK a Favorito</h2>
            <p className="text-gray-300 text-sm mb-3">
              Assista a uma análise aprofundada: {" "}
              <a href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID_HERE" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Ver no YouTube
              </a>
            </p>
          </div>

          {/* Bloco de Aula 3 (DUPLIQUE ESTE PARA MAIS AULAS) */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Aula 3: Gestão de Banca Essencial</h2>
            <img src="/images/banca-management.jpg" alt="Gestão de Banca" className="w-full h-auto rounded-md mb-3" />
            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://youtu.be/xUUG2cAahas"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>

          {/* Bloco de Aula 4 (DUPLIQUE ESTE PARA MAIS AULAS) */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Aula 4: Mercados Alternativos</h2>
            <img src="/images/alt-markets.jpg" alt="Mercados Alternativos" className="w-full h-auto rounded-md mb-3" />
          </div>

          {/* Bloco de Aula 5 (DUPLIQUE ESTE PARA MAIS AULAS) - Ajuste para ser o 1º de uma nova linha ou remova se só quiser 4 por linha */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Aula 5: Psicologia nas Apostas</h2>
            <img src="/images/psychology.jpg" alt="Psicologia" className="w-full h-auto rounded-md mb-3" />
          </div>

        </div> {/* Fim do contêiner grid */}

      </div>
    </div>
  );
}