// src/app/api/test-db-connection/route.js

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tenta uma operação de leitura simples para testar a conexão
    // Nota: findMany sem 'where' pode retornar muitos dados em tabelas grandes.
    // Usamos take(1) para buscar apenas um registro e otimizar o teste.
    await prisma.palpite.findFirst({
        select: { id: true }, // Apenas seleciona o ID para ser leve
        orderBy: { criadoEm: 'desc' },
    });

    console.log('API /api/test-db-connection: CONEXÃO COM O BANCO DE DADOS BEM-SUCEDIDA!');
    return NextResponse.json({ status: 'success', message: 'Conexão com o banco de dados OK. Dados acessíveis.' });

  } catch (error) {
    console.error('API /api/test-db-connection: ERRO NA CONEXÃO COM O BANCO DE DADOS:', error);
    // Erro comum de conexão (P1001) ou variável de ambiente (P1012), etc.
    const errorMessage = error.message || 'Erro desconhecido ao conectar ao banco.';
    const errorCode = error.code || 'N/A';
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Falha na conexão com o banco de dados.', 
        details: errorMessage,
        errorCode: errorCode
      }, 
      { status: 500 }
    );
  }
}