// src/components/Header.js

"use client"; // Marcamos como um Componente de Cliente por causa do botão

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    // Chama nossa API de logout que já está pronta
    const res = await fetch('/api/auth/logout', { method: 'POST' });

    // Se o logout deu certo, redireciona para a página de login
    if (res.ok) {
      router.push('/login');
    } else {
      alert("Falha ao fazer logout.");
    }
  };

  return (
    <header className="flex justify-between items-center w-full">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white">
        Tips<span className="text-green-500">Gol</span>BR
      </h1>
      <button 
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm md:text-base"
      >
        Sair
      </button>
    </header>
  );
}