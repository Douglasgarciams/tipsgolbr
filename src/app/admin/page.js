"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormattedDate from '@/components/FormattedDate';

// Lista de métodos de aposta (DEVE SER IGUAL AO ENUM NO SCHEMA.PRISMA, EM UPPER_SNAKE_CASE)
const METODOS_DE_APOSTA = [
  'LAY_0X1', 'LAY_0X2', 'LAY_0X3', 'LAY_GOLEADA', 'LAY_1X0', 'LAY_2X0', 'LAY_3X0',
  'BACK_GOLEADA', 'BACK_CASA', 'BACK_VISITANTE', 'LAY_CASA', 'LAY_VISITANTE',
  'OVER_0_5HT', 'OVER_1_5HT', 'OVER_2_5HT', 'OVER_3_5HT', 'OVER_0_5FT',
  'OVER_1_5FT', 'OVER_2_5FT', 'OVER_3_5FT', 'OVER_4_5FT', 'OVER_5_5FT',
  'OVER_6_5FT', 'OVER_7_5FT',
  'UNDER_0_5FT', 'UNDER_1_5FT', 'UNDER_2_5FT', 'UNDER_3_5FT', 'UNDER_4_5FT',
  'UNDER_5_5FT', 'UNDER_6_5FT', 'UNDER_7_5FT', 'UNDER_0_5HT', 'UNDER_1_5HT',
  'UNDER_2_5HT', 'UNDER_3_5HT', 'UNDER_4_5HT',
  'BACK_DUPLA_CHANCE', 'LAY_DUPLA_CHANCE'
];

// Função auxiliar para formatar o nome do enum para exibição (ex: LAY_0X1 -> Lay 0x1)
const formatMetodoName = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export default function AdminPage() {
  const initialState = {
    competicao: '',
    jogo: '',
    dataHora: '', // String no formato 'YYYY-MM-DDTHH:MM'
    palpite: '',
    link: '',
    oddpesquisada: '',
    metodoAposta: '',
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
      if (res.ok) {
        setPalpites(await res.json());
      }
    } catch (error) {
      console.error("Falha ao buscar palpites:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        setUsers(await res.json());
      }
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

    // CONVERSÃO PARA UTC ANTES DE ENVIAR PARA O BACKEND
    // Pega a string 'YYYY-MM-DDTHH:MM' do input datetime-local
    // Cria um objeto Date LOCAL e converte para uma string ISO UTC
    let dataHoraUTC = null;
    if (formData.dataHora) {
        const localDate = new Date(formData.dataHora); // Interpreta como data local
        dataHoraUTC = localDate.toISOString(); // Converte para string ISO UTC (YYYY-MM-DDTHH:MM:SS.sssZ)
    }

    const body = {
      ...formData,
      dataHora: dataHoraUTC, // NOVO: Envia a data e hora já em UTC
      esporte: 'Futebol',
      odds: formData.oddpesquisada ? parseFloat(formData.oddpesquisada) : null,
      palpite: formData.metodoAposta,
      metodoAposta: formData.metodoAposta || null,
      placar: formData.placar || null,
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
      }
      catch (error) {
        setMessage(`Erro: ${error.message}`);
      }
    }
  };

  const handleEditPalpite = (palpite) => {
    setEditingId(palpite.id);
    // Ao editar, a data recebida do backend (que é UTC) precisa ser convertida de volta para o formato local
    // que o input type="datetime-local" espera ('YYYY-MM-DDTHH:MM')
    let dataFormatadaLocal = '';
    if (palpite.dataHora) {
        const date = new Date(palpite.dataHora); // Interpreta como UTC se tiver 'Z' ou como local se não tiver
        // Para formatar como 'YYYY-MM-DDTHH:MM' no fuso horário local:
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        dataFormatadaLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setFormData({
      ...initialState,
      ...palpite,
      oddpesquisada: palpite.oddpesquisada || '',
      metodoAposta: palpite.metodoAposta || '',
      palpite: palpite.metodoAposta || '',
      link: palpite.link || '',
      placar: palpite.placar || '',
      dataHora: dataFormatadaLocal, // NOVO: Define a data no formato local para o input
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

  // NOVO: Função para deletar TODOS os palpites
  const handleDeleteAllPalpites = async () => {
    if (window.confirm('ATENÇÃO: Tem certeza que deseja EXCLUIR TODOS os PALPITES criados no admin? Esta ação é irreversível e removerá todas as dicas!')) {
      setIsLoading(true);
      setMessage('');
      try {
        const res = await fetch('/api/palpites/delete-all', { method: 'DELETE' }); // API para deletar todos os palpites
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Falha ao deletar todos os palpites.');
        }
        setMessage('Todos os palpites foram excluídos com sucesso!');
        await fetchPalpites(); // Recarrega a lista de palpites após a exclusão
      } catch (error) {
        setMessage(`Erro: ${error.message}`);
      } finally {
        setIsLoading(false);
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
            {/* REMOVIDO: Campo de texto 'Palpite' - AGORA O METODO DE APOSTA É O PALPITE */}
            {/* <div><label htmlFor="palpite" className="block text-sm font-medium text-gray-300">Palpite</label><input type="text" id="palpite" value={formData.palpite} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div> */}
            <div><label htmlFor="link" className="block text-sm font-medium text-gray-300">Link da Casa de Aposta</label><input type="url" id="link" value={formData.link} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor="oddpesquisada" className="block text-sm font-medium text-gray-300">Odd Pesquisada (ex: 1.85)</label><input type="number" step="0.01" id="oddpesquisada" value={formData.oddpesquisada} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
                {/* CAMPO DE SELEÇÃO DE MÉTODO (DROPDOWN) */}
                <div>
                  <label htmlFor="metodoAposta" className="block text-sm font-medium text-gray-300">Método de Aposta</label>
                  <select id="metodoAposta" value={formData.metodoAposta} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md">
                    <option value="">Selecione um Método</option>
                    {METODOS_DE_APOSTA.map(metodo => (
                      <option key={metodo} value={metodo}>
                        {formatMetodoName(metodo)}
                      </option>
                    ))}
                  </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="resultado" className="block text-sm font-medium text-gray-300">Resultado</label><select id="resultado" value={formData.resultado} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"><option value="PENDING">Pendente</option><option value="GREEN">Green</option><option value="RED">Red</option></select></div>
                <div><label htmlFor="placar" className="block text-sm font-medium text-gray-300">Placar Final (ex: 2-1)</label><input type="text" id="placar" value={formData.placar} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md"/></div>
            </div>
            <div className="flex gap-4 pt-4"><button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500">{isLoading ? 'Salvando...' : (editingId ? 'Atualizar Palpite' : 'Salvar Palpite')}</button>{editingId && (<button type="button" onClick={() => { setEditingId(null); setFormData(initialState); }} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancelar Edição</button>)}</div>
          </form>
          {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
          {/* BOTOES DE DELECAO GERAL */}
          <div className="mt-8 pt-4 border-t border-gray-700 flex flex-col gap-4">
            <button
              onClick={handleDeleteAllPalpites} // NOVO: Botão para deletar todos os palpites
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
            >
              {isLoading ? 'Excluindo Palpites...' : 'Apagar TODOS os PALPITES (Admin)'}
            </button>
            {/* REMOVIDO: Botão de Apagar Todas as Apostas Registradas (Usuários) */}
            {/* <button
              onClick={handleDeleteAllApostas}
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500"
            >
              {isLoading ? 'Excluindo Apostas...' : 'Apagar TODAS as Apostas Registradas (Usuários)'}
            </button> */}
          </div>
        </div>
        {/* SEÇÃO DA LISTA DE PALPITES */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-4">Palpites Cadastrados</h2>
          <div className="space-y-4">{palpites.length > 0 ? palpites.map(p => (<div key={p.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-md"><div><p className="font-bold">{p.jogo}</p><p className="text-sm text-gray-400">{p.palpite}</p></div><div className="flex gap-4"><button onClick={() => handleEditPalpite(p)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md">Editar</button><button onClick={() => handleDeletePalpite(p.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md">Excluir</button></div></div>)) : <p>Nenhum palpite cadastrado.</p>}</div>
        </div>
        {/* SEÇÃO DE GERENCIAMENTO DE USUÁRIOS */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>
          <div className="space-y-4">{users.length > 0 ? users.map(user => (<div key={user.id} className="grid grid-cols-1 md:grid-cols-3 items-center bg-gray-700 p-4 rounded-md gap-4"><div><p className="font-bold truncate">{user.email}</p><p className="text-sm text-gray-400">Cargo: {user.role}</p></div><div><p className={`font-semibold ${user.subscriptionStatus === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>Status: {user.subscriptionStatus}</p>{user.subscriptionExpiresAt && (<p className="text-sm text-gray-400">Expira em: <FormattedDate isoDate={user.subscriptionExpiresAt} /></p>)}</div><div className="text-right">{user.subscriptionStatus === 'ACTIVE' ? (<button onClick={() => handleDeactivateSubscription(user.id)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md">Desativar</button>) : (<button onClick={() => handleActivateSubscription(user.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Ativar por 30 dias</button>)}</div></div>)) : <p>Nenhum usuário cadastrado.</p>}</div>
        </div>
      </div>
    </div>
  );
}