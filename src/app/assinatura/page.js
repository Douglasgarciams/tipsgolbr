// src/app/assinatura/page.js
"use client";

import { useRouter } from 'next/navigation';

export default function AssinaturaPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-center p-6">
      <div className="bg-gray-800 p-8 md:p-12 rounded-lg shadow-lg max-w-lg">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Acesso Negado</h1>
        <p className="text-lg text-gray-300 mb-8">
          Sua assinatura não está ativa ou expirou. Para ter acesso aos palpites, por favor, entre em contato com o administrador para reativar sua conta.
        </p>
        <button 
          onClick={() => router.push('/login')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          Tentar Login Novamente
        </button>
      </div>
    </div>
  );
}