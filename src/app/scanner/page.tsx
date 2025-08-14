// ARQUIVO: src/app/scanner/page.tsx

import ScannerCliente from './ScannerCliente';

/**
 * Esta função é executada no servidor para buscar a lista inicial de jogos ao vivo.
 */
async function getInitialLiveGames() {
  // Garante que a URL da API funcione tanto em desenvolvimento quanto em produção.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/api/live-scanner`, { cache: 'no-store' });
    if (!response.ok) {
        return { error: `Falha ao buscar jogos ao vivo: ${response.statusText}` };
    }
    return await response.json();
  } catch (error: any) {
    return { error: `Erro de conexão: ${error.message}` };
  }
}

/**
 * O componente principal da página do scanner.
 */
export default async function ScannerPage() {
  const initialData = await getInitialLiveGames();
  
  if (initialData?.error) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-red-600">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-xl font-bold text-red-800">Erro ao Carregar Scanner</h1>
                <p>{initialData.error}</p>
                <p className="mt-4 text-sm text-gray-500">Verifique o terminal do servidor para mais detalhes.</p>
            </div>
        </div>
    );
  }

  // O return foi atualizado para usar a nova classe de fundo e organizar o layout.
  return (
    // A classe `scanner-page-background` continua aqui para aplicarmos o novo fundo.
    <main className="scanner-page-background">
      {/* O div interno agora não tem mais limite de largura, ocupando toda a tela.
          Mantemos o padding para que o conteúdo não cole nas bordas. */}
      <div className="w-full p-4 md:p-6">
        <h1 className="scanner-title text-5xl tracking-tight text-center mb-6 drop-shadow-md">Scanner Tips</h1>
        {/* O componente do cliente é renderizado aqui */}
        <ScannerCliente initialData={initialData} />
      </div>
    </main>
  );
}