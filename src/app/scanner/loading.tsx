// ARQUIVO: src/app/scanner/loading.tsx

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white scanner-page-background p-4">
      <h1 className="text-4xl font-bold mb-4">Carregando Jogos...</h1>
      <p className="text-lg text-gray-300 mb-8">Buscando as melhores oportunidades ao vivo.</p>
      
      {/* Animação de Spinner Simples */}
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
    </div>
  );
}
