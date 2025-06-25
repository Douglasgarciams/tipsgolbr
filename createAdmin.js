// createAdmin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Precisamos do bcrypt para hash de senha

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@exemplo.com'; // Altere para o email que você deseja usar
  const password = 'SuaSenhaSegura123'; // Altere para uma senha FORTE e fácil de lembrar
  const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha

  try {
    const adminUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        role: 'ADMIN', // Define o cargo como ADMIN
        subscriptionStatus: 'ACTIVE', // Opcional: define como ativo por padrão
        subscriptionExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Opcional: Ativa por 1 ano
      },
    });
    console.log(`Usuário Admin "${adminUser.email}" criado com sucesso!`);
  } catch (error) {
    if (error.code === 'P2002') { // Erro de email duplicado
      console.error(`Erro: O email "${email}" já existe. Tente outro email ou verifique se o admin já foi criado.`);
    } else {
      console.error("Erro ao criar usuário admin:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Verifica se bcrypt está instalado, se não, instala e tenta novamente
async function ensureBcryptAndRun() {
  try {
    require('bcryptjs');
    createAdminUser();
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('bcryptjs não encontrado. Instalando...');
      const { execSync } = require('child_process');
      try {
        execSync('npm install bcryptjs', { stdio: 'inherit' });
        console.log('bcryptjs instalado. Tentando criar usuário admin novamente...');
        createAdminUser();
      } catch (installError) {
        console.error('Falha ao instalar bcryptjs:', installError.message);
      }
    } else {
      console.error('Erro inesperado:', error);
    }
  }
}

ensureBcryptAndRun();