import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    // 1. Encontrar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      // Por segurança, sempre retorne uma mensagem genérica para não revelar se o email existe ou não.
      console.log(`Tentativa de recuperação para email não encontrado: ${email}`);
      return NextResponse.json({ message: 'Se o email estiver em nosso sistema, um link de recuperação será enviado.' }, { status: 200 });
    }

    // 2. Gerar um token de reset seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 3. Definir a expiração do token (ex: 1 hora a partir de agora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora no futuro

    // 4. Salvar o token no banco de dados
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // 5. Construir o link de reset
    // ATENÇÃO: Usar NEXT_PUBLIC_APP_BASE_URL para garantir a URL pública em produção no Render
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

    if (!appBaseUrl) {
        // Se a variável de ambiente não estiver configurada (o que não deve acontecer após o Passo 1)
        console.error("ERRO: Variável de ambiente NEXT_PUBLIC_APP_BASE_URL não está configurada no ambiente.");
        return NextResponse.json({ message: 'Erro interno ao processar a solicitação: URL base do aplicativo não configurada.' }, { status: 500 });
    }

    const resetLink = `${appBaseUrl}/reset-password?token=${resetToken}`;
    
    // 6. Enviar o email com Resend
    const { data, error } = await resend.emails.send({
      from: 'TipsGolBR <suporte@tipsgolbr.com.br>', // <<<<<<< IMPORTANTE: Substitua pelo seu email verificado
      to: [user.email],
      subject: 'Redefinição de Senha - TipsGolBR',
      // <<<<<<< AQUI ESTÁ O CONTEÚDO HTML COMPLETO DO E-MAIL >>>>>>>
      html: `<p>Olá ${user.email},</p>
             <p>Você solicitou uma redefinição de senha para sua conta TipsGolBR.</p>
             <p>Por favor, clique no link abaixo para redefinir sua senha:</p>
             <p><a href="${resetLink}">Redefinir Senha</a></p>
             <p>Este link é válido por 1 hora.</p>
             <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>`,
      // <<<<<<< FIM DO CONTEÚDO HTML DO E-MAIL >>>>>>>
    });

    if (error) {
      console.error('Erro ao enviar e-mail com Resend:', error);
      return NextResponse.json({ message: 'Erro ao enviar e-mail, mas a solicitação foi processada.' }, { status: 200 });
    }

    console.log('E-mail de recuperação enviado com sucesso:', data);

    return NextResponse.json({ message: 'Se o email estiver em nosso sistema, um link de recuperação será enviado.' }, { status: 200 });

  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    return NextResponse.json({ message: 'Erro interno ao processar a solicitação.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}