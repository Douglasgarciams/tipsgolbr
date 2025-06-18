// src/app/admin/page.js --- VERSÃO FINAL COM O CAMPO "PLACAR"

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const initialState = {
    competicao: '',
    jogo: '',
    dataHora: '',
    palpite: '',
    link: '',
    odds: '',
    confianca: '',
    analise: '',
    resultado: 'PENDING',
    placar: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [palpites, setPalpites] = useState([]);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const fetchPalpites = async () => {
    try {
      const res = await fetch('/api/palpites');
      if (res.ok) setPalpites(await res.json());
    } catch (error) {
      console.error("Falha ao buscar palpites:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error("Falha ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchPalpites();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  
  const handleSubmitPalpite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const body = {
      ...formData,
      esporte: 'Futebol',
      odds: formData.odds ? parseFloat(formData.odds) : null,
      confianca: formData.confianca ? parseInt(formData.confianca) : null,
      placar: formData.placar || null, // <-- MUDANÇA 1: Enviando o placar para a API
    };
    const url = editingId ? `/api/palpites/${editingId}` : '/api/palpites';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Falha ao salvar o palpite');
      setMessage(`Palpite ${editingId ? 'atualizado' : 'salvo'} com sucesso!`);
      setFormData(initialState);
      setEditingId(null);
      await fetchPalpites();
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
        await fetchPalpites();
      } catch (error) {
        setMessage(`Erro: ${error.message}`);
      }
    }
  };
  
  const handleEditPalpite = (palpite) => {
    setEditingId(palpite.id);
    const dataFormatada = new Date(palpite.dataHora).toISOString().slice(0, 16);
    setFormData({ 
      ...initialState,
      ...palpite,
      odds: palpite.odds || '',
      confianca: palpite.confianca || '',
      analise: palpite.analise || '',
      link: palpite.link || '',
      placar: palpite.placar || '', // <-- MUDANÇA 2: Preenchendo o placar ao editar
      dataHora: dataFormatada,
    });
    window.scrollTo(0, 0);
  };

  const handleActivateSubscription = async (userId) => {
    if (window.confirm('Ativar a assinatura por 30 dias para este usuário?')) {
        try {
            const res = await fetch(`/api/users/${userId}/activate`, { method: 'POST' });
            if (!res.ok) throw new Error('Falha ao ativar a assinatura');
            setMessage('Assinatura ativada com sucesso!');
            await fetchUsers();
        } catch (error) {
            setMessage(`Erro: ${error.message}`);
        }
    }
  };
  
  const handleDeactivateSubscription = async (userId) => {
    if (window.confirm('Tem certeza que deseja DESATIVAR a assinatura deste usuário?')) {
      try {
        const res = await fetch(`/api/users/${userId}/deactivate`, { method: 'POST' });
        if (!res.ok) throw new Error('Falha ao desativar a assinatura');
        setMessage('Assinatura desativada com sucesso!');
        await fetchUsers();
      } catch (error) {
        setMessage(`Erro: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Painel de Administrador</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Sair (Logout)</button>
        </div>
        
        {/* SEÇÃO DE GERENCIAMENTO DE PALPITES */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editando Palpite' : 'Criar Novo Palpite'}</h2>
          <form onSubmit={handleSubmitPalpite} className="space-y-4">
            <div><label htmlFor="competicao" className="block text-sm font-medium text-gray-300">Competição</label><input type="text" id="competicao" value={formData.competicao} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="jogo" className="block text-sm font-medium text-gray-300">Jogo (Ex: Time A vs. Time B)</label><input type="text" id="jogo" value={formData.jogo} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="dataHora" className="block text-sm font-medium text-gray-300">Data e Hora do Jogo</label><input type="datetime-local" id="dataHora" value={formData.dataHora} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="palpite" className="block text-sm font-medium text-gray-300">Palpite</label><input type="text" id="palpite" value={formData.palpite} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div><label htmlFor="link" className="block text-sm font-medium text-gray-300">Link da Casa de Aposta</label><input type="url" id="link" value={formData.link} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="odds" className="block text-sm font-medium text-gray-300">Odds (ex: 1.85)</label><input type="number" step="0.01" id="odds" value={formData.odds} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
                <div><label htmlFor="confianca" className="block text-sm font-medium text-gray-300">Confiança (1-5)</label><input type="number" min="1" max="5" id="confianca" value={formData.confianca} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            </div>
            <div><label htmlFor="analise" className="block text-sm font-medium text-gray-300">Breve Análise</label><textarea id="analise" value={formData.analise} onChange={handleChange} rows="3" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"></textarea></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="resultado" className="block text-sm font-medium text-gray-300">Resultado</label><select id="resultado" value={formData.resultado} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"><option value="PENDING">Pendente</option><option value="GREEN">Green</option><option value="RED">Red</option></select></div>
                {/* --- MUDANÇA 3: O campo de input para o placar --- */}
                <div><label htmlFor="placar" className="block text-sm font-medium text-gray-300">Placar Final (ex: 2-1)</label><input type="text" id="placar" value={formData.placar} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            </div>
            <div className="flex gap-4 pt-4"><button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500">{isLoading ? 'Salvando...' : (editingId ? 'Atualizar Palpite' : 'Salvar Palpite')}</button>{editingId && (<button type="button" onClick={() => { setEditingId(null); setFormData(initialState); }} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancelar Edição</button>)}</div>
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