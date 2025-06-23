// src/app/cadastro/page.js - COM IMAGEM DE FUNDO

"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function CadastroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setIsLoading(true);

    try {
      const body = { email, password };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Falha ao cadastrar');
      }

      setMessage('Usuário cadastrado com sucesso! Você já pode fazer o login.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Alterado aqui: Removidas bg-gray-900 e text-white, adicionada cadastro-background
    <div className="min-h-screen cadastro-background flex items-center justify-center">
      {/* O container do formulário com fundo cinza e transparência */}
      <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-sm text-white"> {/* Adicionado text-white aqui */}
        <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-white" // Adicionado text-white
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
              minLength={6}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-white" // Adicionado text-white
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-white" // Adicionado text-white
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-red-500 text-sm">{error}</p>}
        {message && <p className="mt-4 text-center text-green-500 text-sm">{message}</p>}
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-green-500">
            Já tem uma conta? Faça o login
          </Link>
        </div>
      </div>
    </div>
  );
}