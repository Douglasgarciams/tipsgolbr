// ARQUIVO: src/app/jogos-do-dia/page.tsx

import Image from 'next/image'; // Importe o componente de Imagem
import JogosCliente from './JogosCliente';

async function getInitialData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${apiUrl}/api/fetch-daily`, { cache: 'no-store' });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Falha ao buscar dados iniciais:", response.status, errorText);
        return { error: `Falha ao buscar dados: ${response.statusText}` };
    }
    return await response.json();
  } catch (error: any) {
    console.error("Erro de conexão ao buscar dados iniciais:", error);
    return { error: `Erro de conexão: ${error.message}` };
  }
}

export const dynamic = 'force-dynamic';

export default async function JogosDoDiaPage() {
  const initialData = await getInitialData();
  
  if (initialData?.error) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-red-600">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-xl font-bold text-red-800">Erro ao Carregar Dados</h1>
                <p>{initialData.error}</p>
                <p className="mt-4 text-sm text-gray-500">Verifique o terminal do servidor para mais detalhes.</p>
            </div>
        </div>
    );
  }

  return (
    // ALTERADO: Adicionado 'h-screen' e 'flex flex-col' para controlar a altura
    <main className="h-screen max-h-screen flex flex-col bg-slate-100 text-gray-800 font-sans p-4 md:p-2 overflow-hidden">
      <div className="w-full flex flex-col flex-1 min-h-0">
        
        <header className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="w-40">
                <Image
                  src="/images/logosemfundo.jpg"
                  alt="Logo do Site"
                  width={100}
                  height={40}
                  priority
                />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 text-center flex-1">
                Análise Pré-Live
            </h1>
            <div className="w-40"></div>
        </header>
        
        {/* ALTERADO: Adicionado 'flex-1' e 'min-h-0' para fazer o container dos jogos ocupar o espaço restante */}
        <div className="flex-1 min-h-0">
            <JogosCliente initialData={initialData} />
        </div>

      </div>
    </main>
  );
}