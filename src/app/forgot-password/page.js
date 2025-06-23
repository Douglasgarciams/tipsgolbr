// src/app/forgot-password/page.js - CORRIGIDO (SEM <a> DENTRO DE <Link>)

"use client"; // Marca como componente do lado do cliente

import { useState } from 'react';
import Link from 'next/link'; // Para o link de voltar ao login

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // Esta API será criada no próximo passo!
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Falha ao solicitar recuperação de senha.');
      }

      setMessage(data.message); // Mensagem de sucesso da API (ex: "Link enviado para seu email...")
      setEmail(''); // Limpa o campo de email
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-background flex items-center justify-center"> {/* Usa a classe de fundo */}
      <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-sm text-white">
        <h1 className="text-2xl font-bold text-center mb-6">Esqueceu a Senha?</h1>
        <p className="text-sm text-center text-gray-300 mb-6">
          Digite seu email para receber um link de recuperação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
          >
            {isLoading ? 'Enviando...' : 'Solicitar Recuperação'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-green-400 text-sm">{message}</p>}
        {error && <p className="mt-4 text-center text-red-500 text-sm">{error}</p>}

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-blue-400 hover:underline"> {/* <<<<< CORRIGIDO AQUI! */}
            Voltar para o Login
          </Link>
        </p>
      </div>
    </div>
  );
}