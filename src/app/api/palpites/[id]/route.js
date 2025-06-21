// src/app/api/palpites/[id]/route.js --- CÓDIGO FINAL E CORRIGIDO (SEM DUPLICIDADE DELETE)

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id); 
    const palpite = await prisma.palpite.findUnique({
      where: { id: id },
    });

    if (!palpite) {
      return NextResponse.json({ message: 'Palpite não encontrado' }, { status: 404 });
    }

    return NextResponse.json(palpite);
  } catch (error) {
    console.error(`Erro ao buscar palpite ${params.id}:`, error); 
    return NextResponse.json({ message: 'Erro ao buscar palpite' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const updatedPalpite = await prisma.palpite.update({
      where: { id: id },
      data: {
        competicao: data.competicao,
        jogo: data.jogo,
        dataHora: new Date(data.dataHora),
        palpite: data.palpite, // Recebe a string do método do frontend
        link: data.link,
        oddpesquisada: data.oddpesquisada ? parseFloat(data.oddpesquisada) : null,
        metodoAposta: data.metodoAposta || null, // NOVO: Atualizando o campo metodoAposta!
        resultado: data.resultado,
        placar: data.placar,
      },
    });
    return NextResponse.json(updatedPalpite);
  } catch (error) {
    console.error(`Erro ao atualizar palpite (ID: ${params.id}):`, error); 
    return NextResponse.json({ message: "Erro ao atualizar palpite" }, { status: 500 });
  }
}

// Apenas UMA função DELETE agora!
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await prisma.palpite.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    console.error(`Erro ao deletar palpite (ID: ${params.id}):`, error); 
    return NextResponse.json({ message: 'Erro ao deletar palpite' }, { status: 500 });
  }
}