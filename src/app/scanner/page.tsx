// ARQUIVO: src/app/scanner/page.tsx

import ScannerCliente from './ScannerCliente';
import Image from 'next/image';
import Link from 'next/link';
import { Home, BarChart2 } from 'lucide-react'; // Ícones para os novos botões

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
            </div>
        </div>
    );
  }

  return (
    <main className="scanner-page-background">
      <div className="w-full p-4 md:p-3">
        
        {/* Layout de cabeçalho: logo à direita, título centralizado, sem botões */}
        <div className="flex justify-between items-center mb-0">
            {/* Espaço vazio para manter o alinhamento central do título */}
            <div className="flex-none w-[50px] hidden md:block"></div>
            
            {/* Título centralizado, ocupando o espaço flexível restante */}
            <h1 className="scanner-title text-6xl tracking-tight text-center flex-grow">Scanner Tips</h1>

            {/* Logo no canto direito */}
            
        </div>

        {/* O componente do cliente é renderizado aqui */}
        <ScannerCliente initialData={initialData} />
      </div>
    </main>
  );
}