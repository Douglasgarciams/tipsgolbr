// src/app/api/palpites/route.js --- CÓDIGO FINAL E CORRIGIDO (AGORA CORRIGIDO PARA O SCHEMA)

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const palpites = await prisma.palpite.findMany({
      orderBy: {
        criadoEm: 'desc'
      }
    });
    return NextResponse.json(palpites);
  } catch (error) {
    console.error("Erro ao buscar palpites:", error);
    return NextResponse.json(
      { message: "Erro ao buscar palpites" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const novoPalpite = await prisma.palpite.create({
      data: {
        competicao: data.competicao,
        jogo: data.jogo,
        dataHora: new Date(data.dataHora),
        palpite: data.palpite,
        link: data.link,
        // CORRIGIDO: Usando 'oddpesquisada' que vem do frontend
        // E garantindo que seja Float ou null
        oddpesquisada: data.oddpesquisada ? parseFloat(data.oddpesquisada) : null,
        // REMOVIDOS: 'confianca' e 'analise' não existem mais no schema
        resultado: data.resultado,
        placar: data.placar,
      },
    });
    return NextResponse.json(novoPalpite, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar palpite:", error);
    return NextResponse.json({ message: "Erro ao criar palpite" }, { status: 500 });
  }
}

// export async function PUT(request) { /* ... lógica para PUT (atualizar) ... */ }
// export async function DELETE(request) { /* ... lógica para DELETE ... */ }