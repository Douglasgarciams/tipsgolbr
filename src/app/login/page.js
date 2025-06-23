"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Falha no login');
      }

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-background flex flex-col items-center justify-center relative"> {/* Adicionado flex-col e removido justify-center direto no pai */}

      {/* CONTAINER DOS LINKS DO LADO ESQUERDO (permanece no topo esquerdo) */}
      <div className="absolute left-0 top-8 p-4 md:p-8 flex flex-row gap-4 items-center z-10 hidden sm:flex">
        <Link href="/cadastro" className="text-white text-lg md:text-xl font-bold hover:underline bg-blue-600 px-4 py-2 rounded-md shadow-lg">
          Cadastre-se
        </Link>
        <Link href="/aulas" className="text-white text-lg md:text-xl font-bold hover:underline bg-purple-600 px-4 py-2 rounded-md shadow-lg">
          Aulas
        </Link>
      </div>

      {/* O container do formulário de login */}
      <div className="bg-sky-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-sm text-white z-20 mt-35">
        <h1 className="text-2xl font-bold text-center mb-6">Login - Painel Admin</h1>
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-red-500 text-sm">{error}</p>}

        {/* Link "Esqueceu a Senha?" permanece aqui */}
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-400 hover:underline">
            Esqueceu a senha?
          </Link>
        </p>
      </div>

      {/* NOVO: IMAGEM MENOR (LOGO) ABAIXO DO FORMULÁRIO - ALTERADO AQUI */}
      <img 
        src="/images/responsavel.png" // <<<<<<< SUBSTITUA PELO CAMINHO E NOME DO SEU LOGO
        alt="Logo do Site" 
        className="block mx-auto mt-2 w-150 h-auto" // Adicionado 'block mx-auto mt-15' e removido 'absolute'
      />

    </div>

    
  );
}