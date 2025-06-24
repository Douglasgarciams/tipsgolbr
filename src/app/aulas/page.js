// src/app/aulas/page.js
import Link from 'next/link';

export default function AulasPage() {
  const aulasIniciais = [
    {
      titulo: "O que é Back ou lay, nas apostas esportivas",
      video: "https://www.youtube.com/embed/WjoRWrNZ8fA?si=0C4GkhSpYsBtZvqk",
    },
    {
      titulo: "Correct score ou resultado correto",
      video: "https://www.youtube.com/embed/R-rkE6s0PNI?si=EjkLdZMFvooRpeLJ",
    },
    {
      titulo: "Match Odd - resultado final",
      video: "https://www.youtube.com/embed/ZokDDxxwNNA?si=VveTgGLmmmhuFjuf",
    },
    {
      titulo: "Over ou Under / Mais ou Menos",
      video: "https://www.youtube.com/embed/Dv4rNoaHfl0?si=Ex3sevxIaF8uQK7T",
    },
    {
      titulo: "Ambas marcam ou BTTS",
      video: "https://www.youtube.com/embed/Yt500QJkGYQ?si=nvZbx12O9mvyUMUM",
    },
    {
      titulo: "O que é GAP",
      video: "https://www.youtube.com/embed/um7P7BbMwHQ?si=iOAVNy45n864-l_w",
    },
  ];

  const aulasMetodos = [
    {
      titulo: "Lay 0x0",
      video: "https://www.youtube.com/embed/QDOVIYMwVj4?si=6-Sii0YSbhZlO1Cx",
    },
    {
      titulo: "Lay 0x1",
      video: "https://www.youtube.com/embed/Nw8OAImijuI?si=4RR1s6OoJP8BZ6cF",
    },
    {
      titulo: "Lay 0x2",
      video: "https://www.youtube.com/embed/aPdV3YVtjSQ?si=-sP9vj_Q_BTYTodt",
    },
    {
      titulo: "Lay 0x3",
      video: "https://www.youtube.com/embed/O1WcDawEhFM?si=wkcdp7jv-TobUMNV",
    },
    {
      titulo: "Lay 1x3",
      video: "https://www.youtube.com/embed/6ye5UpMI6ro?si=q7WWlF4VPLvBhnPe",
    },
    {
      titulo: "Lay 1x0",
      video: "https://www.youtube.com/embed/Dc0Tjd7ul-4?si=Q5tfE77iwhdVNbdw",
    },
  ];

  return (
    <div className="min-h-screen bg-emerald-900 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Nossas Aulas</h1>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Voltar para Palpites
          </Link>
        </div>

        <p className="text-gray-300 mb-5">Aprenda os melhores métodos e estratégias para suas apostas.</p>
        <p className="text-gray-300 mb-10">AULAS PARA INICIANTES.</p>

        {/* Aulas Iniciais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {aulasIniciais.map((aula, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4">{aula.titulo}</h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={aula.video}
                  title={aula.titulo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-64 sm:h-52 rounded-md"
                ></iframe>
              </div>
            </div>
          ))}
        </div>

        {/* Separador */}
        <h3 className="text-xl font-bold text-gray-200 mb-6">AULAS DOS MÉTODOS.</h3>

        {/* Aulas dos Métodos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {aulasMetodos.map((aula, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4">{aula.titulo}</h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={aula.video}
                  title={aula.titulo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-64 sm:h-52 rounded-md"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
