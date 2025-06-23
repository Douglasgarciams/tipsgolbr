// src/app/reset-password/page.js - CORRIGIDO COM SUSPENSE

"use client";

import { useState, useEffect, Suspense } from 'react'; // <<<<<<< Adicionado Suspense aqui
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Componente wrapper para usar o useSearchParams
function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token de recuperação não encontrado na URL.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!token) {
      setError('Token de recuperação ausente.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Falha ao redefinir senha.');
      }

      setMessage(data.message);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => router.push('/login'), 3000); 

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-sm text-white">
      <h1 className="text-2xl font-bold text-center mb-6">Redefinir Senha</h1>

      {error && <p className="mt-4 text-center text-red-500 text-sm">{error}</p>}
      {message && <p className="mt-4 text-center text-green-400 text-sm">{message}</p>}

      {!token && !error && (
          <p className="text-sm text-center text-gray-300 mb-6">Carregando token...</p> // Ajustei o texto
      )}

      {token && !message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Nova Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-blue-400 hover:underline">
          Voltar para o Login
        </Link>
      </p>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen login-background flex items-center justify-center">
      <Suspense fallback={<div>Carregando página de redefinição...</div>}> {/* <<<<<<< NOVO: Suspense Boundary */}
        <ResetPasswordContent /> {/* <<<<<<< Seu componente original agora está aqui */}
      </Suspense>
    </div>
  );
}