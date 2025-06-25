// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

console.log('PrismaClient está sendo inicializado...'); // <--- ESTA LINHA

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
  console.log('PrismaClient em produção. Conectando ao banco de dados...'); // <--- ESTA LINHA
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
    console.log('PrismaClient em desenvolvimento. Conectando ao banco de dados (via global)...');
  }
  prisma = global.prisma;
}

async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log('PrismaClient CONECTADO com sucesso!'); // <--- E ESTA LINHA
  } catch (e) {
    console.error('Falha ao conectar PrismaClient:', e);
  }
}

connectPrisma();

export default prisma;