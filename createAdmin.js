// createAdmin.js
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@exemplo.com'; // ALtere para o email que você deseja
  const password = 'suaSenhaAdmin123'; // ALtere para a senha que você deseja (forte!)

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    });
    console.log(`Usuário ADMIN criado com sucesso: ${user.email}`);
  } catch (e) {
    if (e.code === 'P2002') {
      console.error(`Erro: Usuário com o email ${email} já existe.`);
    } else {
      console.error("Erro ao criar usuário ADMIN:", e);
    }
  } finally {
    await prisma.$disconnect();
  }
}
createAdminUser();