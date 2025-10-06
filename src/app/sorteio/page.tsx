import FormularioSorteio from './FormularioSorteio';
import ListaInscricoesAdmin from './ListaInscricoesAdmin';

export default function SorteioPage() {
    return (
        <main className="min-h-screen bg-gray-100 text-gray-800 container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-4">Sorteio Especial TipsGoBR</h1>
                <p className="text-center text-gray-600 mb-8">
                    Preencha seus dados abaixo para concorrer a prêmios incríveis. Boa sorte!
                </p>

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