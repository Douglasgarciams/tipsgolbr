// src/app/api/palpites/[id]/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Await params to ensure it's fully resolved before accessing properties
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const palpite = await prisma.palpite.findUnique({
      where: { id: id },
    });

    if (!palpite) {
      return NextResponse.json({ message: 'Palpite não encontrado' }, { status: 404 });
    }

    return NextResponse.json(palpite);
  } catch (error) {
    console.error(`Erro ao buscar palpite ${params.id}:`, error); // Keep params.id for logging, it might still be accessible as a string for context
    return NextResponse.json({ message: 'Erro ao buscar palpite' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params to ensure it's fully resolved before accessing properties
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
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
    console.error(`Erro ao atualizar palpite (ID: ${params.id}):`, error); // Keep params.id for logging
    return NextResponse.json({ message: "Erro ao atualizar palpite" }, { status: 500 });
  }
}

// Apenas UMA função DELETE agora!
export async function DELETE(request, { params }) {
  try {
    // Await params to ensure it's fully resolved before accessing properties
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await prisma.palpite.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Erro ao deletar palpite (ID: ${params.id}):`, error); // Keep params.id for logging
    return NextResponse.json({ message: 'Erro ao deletar palpite' }, { status: 500 });
  }
}