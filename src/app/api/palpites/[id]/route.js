// src/app/api/palpites/[id]/route.js --- CÓDIGO CORRIGIDO

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Função para LER (GET) um ÚNICO palpite pelo seu ID
export async function GET(request, { params }) {
  try {
    // CORRIGIDO: Certificando-se de que params é lido corretamente
    const id = parseInt(params.id); 
    const palpite = await prisma.palpite.findUnique({
      where: { id: id },
    });

    if (!palpite) {
      return NextResponse.json({ message: 'Palpite não encontrado' }, { status: 404 });
    }

    return NextResponse.json(palpite);
  } catch (error) {
    console.error(`Erro ao buscar palpite ${params.id}:`, error); // Adicionado log para depuração
    return NextResponse.json({ message: 'Erro ao buscar palpite' }, { status: 500 });
  }
}

// Função para ATUALIZAR (PUT) um palpite específico
export async function PUT(request, { params }) {
  try {
    // CORRIGIDO: Certificando-se de que params é lido corretamente
    const id = parseInt(params.id);
    const data = await request.json();

    const updatedPalpite = await prisma.palpite.update({
      where: { id: id },
      data: {
        competicao: data.competicao,
        jogo: data.jogo,
        dataHora: new Date(data.dataHora),
        palpite: data.palpite,
        link: data.link,
        // CORRIGIDO: Usando 'oddpesquisada' e removendo 'confianca'/'analise'
        oddpesquisada: data.oddpesquisada ? parseFloat(data.oddpesquisada) : null,
        // confianca e analise removidos daqui
        resultado: data.resultado,
        placar: data.placar,
      },
    });
    return NextResponse.json(updatedPalpite);
  } catch (error) {
    // CORRIGIDO: Acessando params.id dentro do console.error de forma segura
    console.error(`Erro ao atualizar palpite (ID: ${params.id}):`, error); 
    return NextResponse.json({ message: "Erro ao atualizar palpite" }, { status: 500 });
  }
}

// Função para DELETAR (DELETE) um palpite específico
export async function DELETE(request, { params }) {
  try {
    // CORRIGIDO: Certificando-se de que params é lido corretamente
    const id = parseInt(params.id);
    await prisma.palpite.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    console.error(`Erro ao deletar palpite (ID: ${params.id}):`, error); // Adicionado log para depuração
    return NextResponse.json({ message: 'Erro ao deletar palpite' }, { status: 500 });
  }
}