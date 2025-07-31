// ARQUIVO: src/app/jogos-do-dia/page.tsx

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
    <div className="min-h-screen bg-blue-600 text-gray-800 font-sans p-4 md:p-6">
      <div className="max-w-screen-2xl mx-auto">
         <h1 className="font-mono text-3xl font-bold text-white text-center text-900 mb-6">Jogos do Dia: Análise Pré-Live</h1>
         <JogosCliente initialData={initialData} />
      </div>
    </div>
  );
}
