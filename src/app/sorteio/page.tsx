import FormularioSorteio from './FormularioSorteio';
import ListaInscricoesAdmin from './ListaInscricoesAdmin';

export default function SorteioPage() {
    return (
        <main className="min-h-screen bg-gray-100 text-gray-800 container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-4">Sorteio Especial TipsGoBR</h1>
                <p className="text-center text-gray-600 mb-8">
                    Preencha seus dados abaixo para concorrer a uma banca de R$ 1000,00 - sorteio 20/12/2025. Boa sorte!
                </p>

                {/* ### LINK ADICIONADO AQUI ### */}
                <div className="text-center mb-8">
                    <a
                        href="https://fulltbet.bet.br/cadastro?id=5&affid=u_946F823B"
                        target="_blank" // Abre o link em uma nova aba
                        rel="noopener noreferrer" // Boas práticas de segurança para links externos
                        className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-md transition-colors shadow-lg text-lg"
                    >
                        Ainda não tem conta na FullTBet? Cadastre-se aqui!
                    </a>
                </div>

                {/* Formulário continua público */}
                <FormularioSorteio />

                {/* Seção de Visualização das Inscrições agora é um componente de cliente */}
                <div className="mt-12 pt-8 border-t border-gray-300">
                    <ListaInscricoesAdmin />
                </div>
            </div>
        </main>
    );
}