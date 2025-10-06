'use client';

import { useState } from "react";

export default function ListaInscricoesAdmin() {
    const [inscricoes, setInscricoes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    // A senha para ver os inscritos. Mude para algo seguro!
    const SENHA_ADMIN = "Reserva207*"; 

    const handleAuthentication = async () => {
        const senhaDigitada = prompt("Para ver os inscritos, por favor, digite a senha de administrador:");

        if (senhaDigitada === SENHA_ADMIN) {
            setIsAuthenticated(true);
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch('/api/sorteio');
                if (!response.ok) {
                    throw new Error("Falha ao buscar os dados.");
                }
                const data = await response.json();
                setInscricoes(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        } else if (senhaDigitada !== null) { // Se o usuário não clicou em "Cancelar"
            alert("Senha incorreta!");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Inscrições Realizadas</h2>
                {!isAuthenticated && (
                    <button
                        onClick={handleAuthentication}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Ver Inscritos
                    </button>
                )}
            </div>

            {isAuthenticated ? (
                isLoading ? (
                    <p className="text-center text-gray-500">Buscando inscrições...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : inscricoes.length > 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <ul className="space-y-4">
                            {inscricoes.map((inscricao: any, index: number) => (
                                <li key={index} className="border-b pb-4 last:border-b-0">
                                    <p><strong>Nome:</strong> {inscricao.nome}</p>
                                    <p><strong>E-mail:</strong> {inscricao.email}</p>
                                    <p><strong>WhatsApp:</strong> {inscricao.whatsapp}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Nenhuma inscrição registrada ainda.</p>
                )
            ) : (
                <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-md">A lista de inscritos é privada ao administrador.</p>
            )}
        </div>
    );
}