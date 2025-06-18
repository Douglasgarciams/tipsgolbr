// src/components/PalpitesClientView.js

"use client"; // Marcamos como componente de cliente para ter interatividade

import { useState, useMemo } from 'react';
import PalpiteCard from '@/components/PalpiteCard';

// A mesma função de agrupar que tínhamos na página
const agruparPalpites = (palpites) => {
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
            grupos.amanha.push(p);
        } else {
            grupos.proximosDias.push(p);
        }
    });

    grupos.resultados.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    return grupos;
};

// Componente para renderizar uma seção
const PalpiteSection = ({ titulo, palpitesDoGrupo }) => {
    if (palpitesDoGrupo.length === 0) return null;
    return (
        <section className="mb-12">
            <h2 className="text-3xl font-bold text-white border-l-4 border-green-500 pl-4 mb-6">{titulo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{palpitesDoGrupo.map(palpite => (<PalpiteCard key={palpite.id} palpite={palpite} />))}</div>
        </section>
    );
};


export default function PalpitesClientView({ palpites }) {
    // Estado para guardar o filtro ativo. Começa com 'Todos'.
    const [filtroAtivo, setFiltroAtivo] = useState('Todos');

    // Pega a lista de todas as competições únicas para criar os botões
    const competicoes = useMemo(() => {
        const lista = palpites.map(p => p.competicao);
        return ['Todos', ...new Set(lista)];
    }, [palpites]);

    // Filtra os palpites baseado no filtro ativo
    const palpitesFiltrados = useMemo(() => {
        if (filtroAtivo === 'Todos') {
            return palpites;
        }
        return palpites.filter(p => p.competicao === filtroAtivo);
    }, [filtroAtivo, palpites]);

    const palpitesAgrupados = agruparPalpites(palpitesFiltrados);

    return (
        <div>
            {/* Seção de Filtros */}
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

            {/* Seção de Palpites Agrupados */}
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