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

  // O componente AulaCard foi internalizado para não criar novos arquivos.
  const AulaCard = ({ titulo, video }) => (
    <div className="group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 transition-all duration-300 ease-in-out hover:scale-105 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10">
      <div className="aspect-video"> {/* Classe moderna para aspect ratio */}
        <iframe
          src={video}
          title={titulo}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors duration-300">
          {titulo}
        </h3>
      </div>
    </div>
  );

  return (
    // Fundo mais sóbrio e moderno com mais espaçamento vertical
    <div className="min-h-screen bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho com tipografia e espaçamento aprimorados */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
              Nossas Aulas
            </h1>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl">
              Aprenda os melhores métodos e estratégias para suas apostas.
            </p>
          </div>
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shrink-0"
          >
            Voltar para Palpites
          </Link>
        </header>

        {/* Seção de Aulas Iniciais */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-slate-200 border-l-4 border-indigo-500 pl-4 mb-10">
            Aulas para Iniciantes
          </h2>
          {/* Grid mais responsivo que se adapta a telas maiores (até 3 colunas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aulasIniciais.map((aula, index) => (
              <AulaCard key={index} titulo={aula.titulo} video={aula.video} />
            ))}
          </div>
        </section>

        {/* Seção de Aulas dos Métodos */}
        <section>
          <h2 className="text-3xl font-bold text-slate-200 border-l-4 border-indigo-500 pl-4 mb-10">
            Aulas dos Métodos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aulasMetodos.map((aula, index) => (
              <AulaCard key={index} titulo={aula.titulo} video={aula.video} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}