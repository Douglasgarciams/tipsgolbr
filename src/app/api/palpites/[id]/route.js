// src/app/api/palpites/[id]/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Função para LER (GET) um ÚNICO palpite pelo seu ID
// (Útil para a página de edição)
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id); // O 'params.id' vem da URL
    const palpite = await prisma.palpite.findUnique({
      where: { id: id },
    });

    if (!palpite) {
      return NextResponse.json({ message: 'Palpite não encontrado' }, { status: 404 });
    }

    return NextResponse.json(palpite);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar palpite' }, { status: 500 });
  }
}

// Função para ATUALIZAR (PUT) um palpite específico
export async function PUT(request, { params }) {
  // A lógica de segurança do admin que já tínhamos...
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const updatedPalpite = await prisma.palpite.update({
      where: { id: id },
      data: {
        // Campos antigos
        competicao: data.competicao,
        jogo: data.jogo,
        dataHora: new Date(data.dataHora),
        palpite: data.palpite,
        link: data.link,
        // Novos campos que estávamos ignorando
        odds: data.odds,
        confianca: data.confianca,
        analise: data.analise,
        resultado: data.resultado,
        placar: data.placar,
      },
    });
    return NextResponse.json(updatedPalpite);
  } catch (error) {
    console.error(`Erro ao atualizar palpite ${params.id}:`, error);
    return NextResponse.json({ message: "Erro ao atualizar palpite" }, { status: 500 });
  }
}

// Função para DELETAR (DELETE) um palpite específico
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await prisma.palpite.delete({
      where: { id: id },
    });

    // Retorna uma resposta de sucesso sem conteúdo
    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao deletar palpite' }, { status: 500 });
  }
}