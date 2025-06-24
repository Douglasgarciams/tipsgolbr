// src/app/aulas/page.js - COM LAYOUT DE 4 BLOCOS E SEM TEXTO DESCRITIVO (VOLTANDO AO ORIGINAL DE TESTE)

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

        <p className="text-gray-300 mb-8">
          AULAS PARA INICIANTES.
        </p>

        {/* Contêiner para o Grid de Aulas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

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
                src="https://www.youtube.com/embed/WjoRWrNZ8fA?si=0C4GkhSpYsBtZvqk" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>
{/* Bloco de Aula 2 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Correct score ou resultado correto</h2>

            <img
              src="/images/correct.png"
              alt="Exemplo do Método Lay 0x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/R-rkE6s0PNI?si=EjkLdZMFvooRpeLJ" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>
{/* Bloco de Aula 3 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Match Odd - resultado final</h2>

            <img
              src="/images/match.jpg"
              alt="Exemplo do Método Lay 0x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/ZokDDxxwNNA?si=VveTgGLmmmhuFjuf" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>
{/* Bloco de Aula 4 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Over ou Unnder / Mais ou Menos</h2>

            <img
              src="/images/over.jpg"
              alt="Exemplo do Método Lay 0x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/Dv4rNoaHfl0?si=Ex3sevxIaF8uQK7T" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>
{/* Bloco de Aula 5 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">Ambas marcam ou BTTS</h2>

            <img
              src="/images/ambas.jpg"
              alt="Exemplo do Método Lay 0x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/Yt500QJkGYQ?si=nvZbx12O9mvyUMUM" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>
{/* Bloco de Aula 6 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">O que é GAP</h2>

            <img
              src="/images/gap.jpg"
              alt="Exemplo do Método Lay 0x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/um7P7BbMwHQ?si=iOAVNy45n864-l_w" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>
          
          <form className="space-y-6"></form>
            <p className="text-gray-300 space-y-8">
              AULAS DOS MÉTODOS.
            </p>
            <form className="space-y-6"></form>

            {/* Bloco de Aula 7 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">Lay 0x0</h2>

            <img
              src="/images/lay 0x0.jpg"
              alt="Exemplo do Método Lay 0x0"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/QDOVIYMwVj4?si=6-Sii0YSbhZlO1Cx" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>


{/* Bloco de Aula 8 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">Lay 0x1</h2>

            <img
              src="/images/lay 0x1.jpg"
              alt="Exemplo do Método Lay 0x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/Nw8OAImijuI?si=4RR1s6OoJP8BZ6cF" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>

{/* Bloco de Aula 9 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">Lay 0x2</h2>

            <img
              src="/images/lay 0x2.jpg"
              alt="Exemplo do Método Lay 0x2"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/aPdV3YVtjSQ?si=-sP9vj_Q_BTYTodt" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>

{/* Bloco de Aula 10 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">Lay 0x3</h2>

            <img
              src="/images/lay 0x3.jpg"
              alt="Exemplo do Método Lay 0x2"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/O1WcDawEhFM?si=wkcdp7jv-TobUMNV" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>

          {/* Bloco de Aula 11 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">Lay 1x3</h2>

            <img
              src="/images/lay 1x3.jpg"
              alt="Exemplo do Método Lay 1x3"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/6ye5UpMI6ro?si=q7WWlF4VPLvBhnPe" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>

          {/* Bloco de Aula 12 */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-10">Lay 1x0</h2>

            <img
              src="/images/lay 1x0.jpg"
              alt="Exemplo do Método Lay 1x0"
              className="w-full h-auto rounded-md mb-3"
            />

            <div className="aspect-w-16 aspect-h-9 mb-3">
              <iframe
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/Dc0Tjd7ul-4?si=Q5tfE77iwhdVNbdw" // <<<< VOLTANDO AO PLACEHOLDER
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </div>

        </div> {/* Fim do contêiner grid */}

      </div>
    </div>
  );
}