// src/components/PalpitesClientView.js

"use client";

import { useState, useMemo, useEffect } from 'react';
import PalpiteCard from '@/components/PalpiteCard';

const agruparPalpites = (palpites) => {
    // console.log('Agrupando palpites, total:', palpites.length); // NOVO LOG
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const depoisDeAmanha = new Date(hoje);
    depoisDeAmanha.setDate(hoje.getDate() + 2);

    const grupos = { hoje: [], amanha: [], proximosDias: [], resultados: [] };

    palpites.forEach(p => {
        const dataPalpite = new Date(p.dataHora);
        if (dataPalpite < hoje) {
            grupos.resultados.push(p);
        } else if (dataPalpite >= hoje && dataPalpite < amanha) {
            grupos.hoje.push(p);
        } else if (dataPalpite >= amanha && dataPalpite < depoisDeAmanha) {
            grupos.proximosDias.push(p);
        } else {
            grupos.amanha.push(p); // Corrigido para garantir que amanhã seja adicionado corretamente
        }
    });

    // Certifique-se de que próximosDias e resultados também sejam ordenados se necessário
    grupos.resultados.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    grupos.hoje.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    grupos.amanha.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    grupos.proximosDias.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    
    return grupos;
};

const PalpiteSection = ({ titulo, palpitesDoGrupo }) => {
    if (palpitesDoGrupo.length === 0) return null;
    return (
        <section className="mb-12">
            <h2 className="text-3xl font-bold text-white border-l-4 border-green-500 pl-4 mb-6">{titulo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {palpitesDoGrupo.map(palpite => (
                    <PalpiteCard key={palpite.id} palpite={palpite} />
                ))}
            </div>
        </section>
    );
};


export default function PalpitesClientView({ palpites: initialPalpites }) { // Renomeado prop para initialPalpites
    const [filtroAtivo, setFiltroAtivo] = useState('Todos');
    const [isClient, setIsClient] = useState(false);
    const [palpitesFromApi, setPalpitesFromApi] = useState([]); // NOVO ESTADO para palpites buscados no cliente
    const [loadingClientFetch, setLoadingClientFetch] = useState(true); // NOVO ESTADO para loading do fetch cliente
    const [clientFetchError, setClientFetchError] = useState(null); // NOVO ESTADO para erro do fetch cliente

    // NOVO: Effect para buscar palpites no cliente APÓS a hidratação
    useEffect(() => {
        setIsClient(true); // Confirma que estamos no cliente

        const fetchPalpitesOnClient = async () => {
            console.log('PalpitesClientView: Tentando buscar palpites via API no cliente...'); // NOVO LOG
            try {
                setLoadingClientFetch(true);
                const res = await fetch('/api/palpites');
                if (!res.ok) {
                    throw new Error(`Erro HTTP ao buscar palpites: ${res.status} - ${res.statusText}`);
                }
                const data = await res.json();
                setPalpitesFromApi(data);
                console.log('PalpitesClientView: Palpites recebidos da API no cliente:', data.length); // NOVO LOG
            } catch (err) {
                console.error('PalpitesClientView: Erro ao buscar palpites no cliente:', err); // NOVO LOG
                setClientFetchError(err.message);
            } finally {
                setLoadingClientFetch(false);
            }
        };

        // Buscamos os palpites novamente no cliente para garantir a consistência
        fetchPalpitesOnClient();

    }, []);

    // Usa os palpites buscados no cliente se available, senão usa os iniciais (SSR)
    // No cliente, palpites será o resultado de palpitesFromApi
    const currentPalpites = isClient ? palpitesFromApi : initialPalpites;


    // console.log('PalpitesClientView: Renderizando com palpites (currentPalpites.length):', currentPalpites.length); // NOVO LOG
    // console.log('PalpitesClientView: Valor de isClient:', isClient); // NOVO LOG


    const competicoes = useMemo(() => {
        const lista = currentPalpites.map(p => p.competicao);
        return ['Todos', ...new Set(lista)];
    }, [currentPalpites]);

    const palpitesFiltrados = useMemo(() => {
        if (filtroAtivo === 'Todos') {
            return currentPalpites;
        }
        return currentPalpites.filter(p => p.competicao === filtroAtivo);
    }, [filtroAtivo, currentPalpites]);

    const palpitesAgrupados = agruparPalpites(palpitesFiltrados);

    if (!isClient) {
        // Renderiza um fallback simples no servidor para evitar hidratação inconsistente
        return <p className="text-center text-gray-400 text-xl">Carregando palpites (SSR)...</p>;
    }

    if (loadingClientFetch) {
      return <p className="text-center text-blue-400 text-xl">Buscando palpites (Cliente)...</p>;
    }

    if (clientFetchError) {
      return <p className="text-center text-red-400 text-xl">Erro ao carregar palpites: {clientFetchError}</p>;
    }

    // O conteúdo real só é renderizado após a hidratação no cliente E o fetch ser concluído
    return (
        <div>
            <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4">Filtrar por Competição:</h2>
                <div className="flex flex-wrap gap-2">
                    {competicoes.map(comp => (
                        <button
                            key={comp}
                            onClick={() => setFiltroAtivo(comp)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filtroAtivo === comp ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                        >
                            {comp}
                        </button>
                    ))}
                </div>
            </div>

            {palpitesFiltrados.length === 0 ? (
                <p className="text-center text-gray-400 text-xl">Nenhum palpite encontrado para o filtro selecionado.</p>
            ) : (
                <div>
                    <PalpiteSection titulo="Jogos de Hoje" palpitesDoGrupo={palpitesAgrupados.hoje} />
                    <PalpiteSection titulo="Jogos de Amanhã" palpitesDoGrupo={palpitesAgrupados.amanha} />
                    <PalpiteSection titulo="Próximos Dias" palpitesDoGrupo={palpitesAgrupados.proximosDias} />
                    <PalpiteSection titulo="Resultados Recentes" palpitesDoGrupo={palpitesAgrupados.resultados} />
                </div>
            )}
        </div>
    );
}
