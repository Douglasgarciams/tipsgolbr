import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  let resolvedParams; // Declare resolvedParams here
  try {
    // Assign resolvedParams here
    resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const palpite = await prisma.palpite.findUnique({
      where: { id: id },
    });

    if (!palpite) {
      return NextResponse.json({ message: 'Palpite não encontrado' }, { status: 404 });
    }

    return NextResponse.json(palpite);
  } catch (error) {
    // Now resolvedParams is accessible here
    console.error(`Erro ao buscar palpite ${resolvedParams?.id || 'ID desconhecido'}:`, error);
    return NextResponse.json({ message: 'Erro ao buscar palpite' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  let resolvedParams; // Declare resolvedParams here
  try {
    // Assign resolvedParams here
    resolvedParams = await params;
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
    // Now resolvedParams is accessible here
    console.error(`Erro ao atualizar palpite (ID: ${resolvedParams?.id || 'ID desconhecido'}):`, error);
    return NextResponse.json({ message: "Erro ao atualizar palpite" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  let resolvedParams; // Declare resolvedParams here
  try {
    // Assign resolvedParams here
    resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    await prisma.palpite.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Now resolvedParams is accessible here
    console.error(`Erro ao deletar palpite (ID: ${resolvedParams?.id || 'ID desconhecido'}):`, error);
    return NextResponse.json({ message: 'Erro ao deletar palpite' }, { status: 500 });
  }
}