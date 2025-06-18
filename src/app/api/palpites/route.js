// src/app/api/palpites/route.js --- CÓDIGO FINAL E CORRIGIDO

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const palpites = await prisma.palpite.findMany({
      orderBy: {
        criadoEm: 'desc'
      } // A chave do findMany() fecha aqui
    }); // O parêntese do findMany() fecha aqui
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
        esporte: data.esporte,
        competicao: data.competicao,
        jogo: data.jogo,
        dataHora: new Date(data.dataHora),
        palpite: data.palpite,
        link: data.link,
      },
    });
    return NextResponse.json(novoPalpite, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar palpite:", error);
    return NextResponse.json(
      { message: "Erro ao criar palpite" },
      { status: 500 }
    );
  }
}