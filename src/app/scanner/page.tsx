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

  return (
    <div className="min-h-screen bg-blue-600 text-gray-800 font-sans p-4 md:p-7">
      <div className="w-full max-w-none"> {/* Ocupa a largura total */}
        <h1 className="text-4xl font-bold text-white text-center text-1000 mb-6">Scanner Tips</h1>
        {/* O componente do cliente (do seu Canvas) é renderizado aqui */}
        <ScannerCliente initialData={initialData} />
      </div>
    </div>
  );
}
