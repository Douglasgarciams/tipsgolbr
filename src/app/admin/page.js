// src/app/admin/page.js --- VERSÃO COMPLETA E FINAL

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  // Estados para o formulário de palpites
  const [formData, setFormData] = useState({ esporte: 'Futebol ⚽', competicao: '', jogo: '', dataHora: '', palpite: '', link: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Estados para as listas
  const [palpites, setPalpites] = useState([]);
  const [users, setUsers] = useState([]);

  const router = useRouter();

  // --- FUNÇÕES DE BUSCA DE DADOS ---
  const fetchPalpites = async () => {
    const res = await fetch('/api/palpites');
    if (res.ok) setPalpites(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    fetchPalpites();
    fetchUsers();
  }, []);

  // --- FUNÇÕES DE LÓGICA (HANDLERS) ---
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  // Adicione esta função dentro do seu componente AdminPage
const handleDeactivateSubscription = async (userId) => {
  if (window.confirm('Tem certeza que deseja DESATIVAR a assinatura deste usuário? O acesso dele será bloqueado imediatamente.')) {
    try {
      const res = await fetch(`/api/users/${userId}/deactivate`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao desativar a assinatura');
      setMessage('Assinatura desativada com sucesso!');
      fetchUsers(); // Atualiza a lista de usuários
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    }
  }
};
  
  const handleSubmitPalpite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const url = editingId ? `/api/palpites/${editingId}` : '/api/palpites';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, dataHora: new Date(formData.dataHora) }) });
      if (!res.ok) throw new Error('Falha ao salvar o palpite');
      setMessage(`Palpite ${editingId ? 'atualizado' : 'salvo'} com sucesso!`);
      setFormData({ esporte: 'Futebol ⚽', competicao: '', jogo: '', dataHora: '', palpite: '', link: '' });
      setEditingId(null);
      fetchPalpites();
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePalpite = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este palpite?')) {
      try {
        const res = await fetch(`/api/palpites/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Falha ao deletar o palpite');
        setMessage('Palpite deletado com sucesso!');
        fetchPalpites();
      } catch (error) {
        setMessage(`Erro: ${error.message}`);
      }
    }
  };
  
  const handleEditPalpite = (palpite) => {
    setEditingId(palpite.id);
    const dataFormatada = new Date(palpite.dataHora).toISOString().slice(0, 16);
    setFormData({ ...palpite, dataHora: dataFormatada });
    window.scrollTo(0, 0);
  };

  const handleActivateSubscription = async (userId) => {
    if (window.confirm('Ativar a assinatura por 30 dias para este usuário?')) {
        try {
            const res = await fetch(`/api/users/${userId}/activate`, { method: 'POST' });
            if (!res.ok) throw new Error('Falha ao ativar a assinatura');
            setMessage('Assinatura ativada com sucesso!');
            fetchUsers();
        } catch (error) {
            setMessage(`Erro: ${error.message}`);
        }
    }
  };

  // --- INTERFACE (JSX) ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Painel de Administrador</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">
            Sair (Logout)
          </button>
        </div>
        
        {/* SEÇÃO DE GERENCIAMENTO DE PALPITES */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editando Palpite' : 'Criar Novo Palpite'}</h2>
          <form onSubmit={handleSubmitPalpite} className="space-y-4">
            {/* Campos do formulário de palpites */}
            <div><label htmlFor="esporte" className="block text-sm font-medium text-gray-300">Esporte</label><input type="text" id="esporte" value={formData.esporte} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="competicao" className="block text-sm font-medium text-gray-300">Competição</label><input type="text" id="competicao" value={formData.competicao} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="jogo" className="block text-sm font-medium text-gray-300">Jogo (Ex: Time A vs. Time B)</label><input type="text" id="jogo" value={formData.jogo} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="dataHora" className="block text-sm font-medium text-gray-300">Data e Hora do Jogo</label><input type="datetime-local" id="dataHora" value={formData.dataHora} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="palpite" className="block text-sm font-medium text-gray-300">Palpite</label><input type="text" id="palpite" value={formData.palpite} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="link" className="block text-sm font-medium text-gray-300">Link da Casa de Aposta</label><input type="url" id="link" value={formData.link} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div className="flex gap-4"><button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500">{isLoading ? 'Salvando...' : (editingId ? 'Atualizar Palpite' : 'Salvar Palpite')}</button>{editingId && (<button type="button" onClick={() => { setEditingId(null); setFormData({ esporte: 'Futebol ⚽', competicao: '', jogo: '', dataHora: '', palpite: '', link: '' }); }} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancelar Edição</button>)}</div>
          </form>
          {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
        </div>

        {/* SEÇÃO DA LISTA DE PALPITES */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-4">Palpites Cadastrados</h2>
          <div className="space-y-4">{palpites.length > 0 ? palpites.map(p => (<div key={p.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-md"><div className="flex-1"><p className="font-bold">{p.jogo}</p><p className="text-sm text-gray-400">{p.palpite}</p></div><div className="flex gap-4"><button onClick={() => handleEditPalpite(p)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md">Editar</button><button onClick={() => handleDeletePalpite(p.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md">Excluir</button></div></div>)) : <p>Nenhum palpite cadastrado.</p>}</div>
        </div>

        {/* SEÇÃO DE GERENCIAMENTO DE USUÁRIOS */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>
          <div className="space-y-4">{users.length > 0 ? users.map(user => (<div key={user.id} className="grid grid-cols-1 md:grid-cols-3 items-center bg-gray-700 p-4 rounded-md gap-4"><div><p className="font-bold truncate">{user.email}</p><p className="text-sm text-gray-400">Cargo: {user.role}</p></div><div><p className={`font-semibold ${user.subscriptionStatus === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>Status: {user.subscriptionStatus}</p>{user.subscriptionExpiresAt && (<p className="text-sm text-gray-400">Expira em: {new Date(user.subscriptionExpiresAt).toLocaleDateString('pt-BR')}</p>)}</div><div className="text-right">{user.subscriptionStatus === 'ACTIVE' ? (<button onClick={() => handleDeactivateSubscription(user.id)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md">Desativar</button>) : (<button onClick={() => handleActivateSubscription(user.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Ativar por 30 dias</button>)}</div></div>)) : <p>Nenhum usuário cadastrado.</p>}</div>
        </div>
      </div>
    </div>
  );
}