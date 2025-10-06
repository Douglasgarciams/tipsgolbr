'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormularioSorteio() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        try {
            const response = await fetch('/api/sorteio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, whatsapp }),
            });

            if (!response.ok) {
                throw new Error('Falha ao registrar. Tente novamente.');
            }

            setStatus({ loading: false, error: '', success: 'Inscrição realizada com sucesso!' });
            // Limpa o formulário
            setNome('');
            setEmail('');
            setWhatsapp('');
            // Atualiza a página para mostrar a nova inscrição na lista
            router.refresh();

        } catch (error: any) {
            setStatus({ loading: false, error: error.message, success: '' });
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input
                        type="text"
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp (com DDD)</label>
                    <input
                        type="tel"
                        id="whatsapp"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        required
                        placeholder="Ex: 11987654321"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={status.loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                    >
                        {status.loading ? 'Enviando...' : 'Participar do Sorteio'}
                    </button>
                </div>
                {status.success && <p className="text-green-600 text-center">{status.success}</p>}
                {status.error && <p className="text-red-600 text-center">{status.error}</p>}
            </form>
        </div>
    );
}