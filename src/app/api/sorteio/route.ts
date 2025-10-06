import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para buscar (GET) todas as inscrições
export async function GET() {
    try {
        const inscricoes = await prisma.sorteio.findMany({
            orderBy: {
                createdAt: 'desc', // Mostra os mais recentes primeiro
            },
        });
        return NextResponse.json(inscricoes);
    } catch (error) {
        console.error("Erro ao buscar inscrições:", error);
        return NextResponse.json({ error: "Falha ao buscar dados." }, { status: 500 });
    }
}

// Função para criar (POST) uma nova inscrição
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nome, email, whatsapp } = body;

        if (!nome || !email || !whatsapp) {
            return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
        }

        const novaInscricao = await prisma.sorteio.create({
            data: {
                nome,
                email,
                whatsapp,
            },
        });

        return NextResponse.json(novaInscricao, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar inscrição:", error);
        return NextResponse.json({ error: "Falha ao registrar inscrição." }, { status: 500 });
    }
}