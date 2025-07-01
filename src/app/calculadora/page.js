"use client";

import { useState, useEffect } from 'react';

export default function BackLayCalculatorPage() {
  // Estado para o tipo de aposta principal (o que o usuário está colocando primeiro)
  const [mainBetType, setMainBetType] = useState('back'); // 'back' ou 'lay'

  // Estados para os inputs
  const [mainOdd, setMainOdd] = useState(0);
  const [mainStake, setMainStake] = useState(0); // Para LAY, será a Responsabilidade (Liability)

  const [oppositeOdd, setOppositeOdd] = useState(0);

  // Estados para os resultados calculados
  const [oppositeStake, setOppositeStake] = useState(0); // Stake da aposta oposta
  const [profitMainBetWin, setProfitMainBetWin] = useState(0); // Lucro se a aposta principal ganha
  const [profitOppositeBetWin, setProfitOppositeBetWin] = useState(0); // Lucro se a aposta oposta ganha
  const [overallProfit, setOverallProfit] = useState(0); // Lucro geral (deve ser igual em ambos os lados)
  const [mainBetLiability, setMainBetLiability] = useState(0); // Responsabilidade da aposta principal (para exibir no Lay)
  const [layStakeToWin, setLayStakeToWin] = useState(0); // NOVO: Stake Lay para Ganhar (se Lay for a aposta principal)


  useEffect(() => {
    const numMainOdd = parseFloat(mainOdd) || 0;
    const numMainStake = parseFloat(mainStake) || 0;
    const numOppositeOdd = parseFloat(oppositeOdd) || 0;

    // Resetar resultados se os inputs básicos não forem válidos
    if (numMainOdd <= 1 || numMainStake <= 0 || numOppositeOdd <= 1) {
      setOppositeStake(0);
      setProfitMainBetWin(0);
      setProfitOppositeBetWin(0);
      setOverallProfit(0);
      setMainBetLiability(0);
      setLayStakeToWin(0); // NOVO: Resetar também
      return;
    }

    let calculatedOppositeStake = 0;
    let calculatedProfitMainBetWin = 0;
    let calculatedProfitOppositeBetWin = 0;
    let calculatedMainBetLiability = 0; // Responsabilidade da aposta principal
    let calculatedLayStakeToWin = 0; // NOVO

    if (mainBetType === 'back') {
      // Cenário: Você fez uma aposta BACK (Stake = numMainStake) e quer cobrir com LAY
      const backStake = numMainStake;
      const backOdd = numMainOdd;
      const layOdd = numOppositeOdd;

      // Cálculo da Stake LAY necessária (o valor que você GANHA se o LAY vencer)
      // Stake Lay (para ganhar) = (Stake Back * Odd Back) / Odd Lay
      calculatedOppositeStake = (backStake * backOdd) / layOdd;
      
      // Responsabilidade da Aposta LAY (o que você PAGA se o LAY perder)
      const layLiability = calculatedOppositeStake * (layOdd - 1);

      calculatedMainBetLiability = backStake; // Responsabilidade da aposta BACK é a própria stake

      // Lucro se a Aposta BACK Ganha (Lay perde)
      // Lucro do Back - Responsabilidade do Lay
      calculatedProfitMainBetWin = (backStake * (backOdd - 1)) - layLiability;

      // Lucro se a Aposta LAY Ganha (Back perde)
      // Lucro do Lay (Stake Lay) - Stake Back (perdida)
      calculatedProfitOppositeBetWin = calculatedOppositeStake - backStake;

    } else { // mainBetType === 'lay'
      // Cenário: Você fez uma aposta LAY (Stake = Responsabilidade/Liability) e quer cobrir com BACK
      const layLiability = numMainStake; // A "stake" inserida pelo usuário é a responsabilidade
      const layOdd = numMainOdd;
      const backOdd = numOppositeOdd;

      // Stake LAY (o valor que você GANHA se o LAY vencer)
      calculatedLayStakeToWin = layLiability / (layOdd - 1); // NOVO: Calculado aqui

      // Cálculo da Stake BACK necessária
      // Stake Back = (Responsabilidade Lay * Odd Lay) / ((Odd Lay - 1) * Odd Back)
      calculatedOppositeStake = (layLiability * layOdd) / ((layOdd - 1) * backOdd);
      
      calculatedMainBetLiability = layLiability; // A responsabilidade da aposta LAY é a própria stake (input)

      // Lucro se a Aposta LAY Ganha (Back perde)
      // Lucro do Lay (Lay Stake to Win) - Stake Back (perdida)
      calculatedProfitMainBetWin = calculatedLayStakeToWin - calculatedOppositeStake;

      // Lucro se a Aposta BACK Ganha (Lay perde)
      // Lucro do Back - Responsabilidade Lay (perdida)
      calculatedProfitOppositeBetWin = (calculatedOppositeStake * (backOdd - 1)) - layLiability;
    }

    setOppositeStake(calculatedOppositeStake);
    setProfitMainBetWin(calculatedProfitMainBetWin);
    setProfitOppositeBetWin(calculatedProfitOppositeBetWin);
    // O lucro geral deve ser o mesmo em ambos os cenários
    setOverallProfit(calculatedProfitMainBetWin); 
    setMainBetLiability(calculatedMainBetLiability);
    setLayStakeToWin(calculatedLayStakeToWin); // NOVO: Atualiza o estado
    
  }, [mainBetType, mainOdd, mainStake, oppositeOdd]); // Removidas comissões das dependências

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Calculadora Back/Lay</h1>

        {/* Seleção do Tipo de Aposta Principal */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Qual aposta você está colocando primeiro?</h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setMainBetType('back')}
              className={`px-6 py-3 rounded-full font-bold transition-colors ${
                mainBetType === 'back' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Estou Apostando BACK
            </button>
            <button
              onClick={() => setMainBetType('lay')}
              className={`px-6 py-3 rounded-full font-bold transition-colors ${
                mainBetType === 'lay' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Estou Apostando LAY
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Seção da Aposta Principal */}
          <div className="bg-gray-700 p-6 rounded-md shadow-inner">
            <h2 className={`text-xl font-semibold mb-4 ${mainBetType === 'back' ? 'text-green-400' : 'text-red-400'}`}>
              Aposta {mainBetType === 'back' ? 'BACK' : 'LAY'} (Sua Aposta Principal)
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="mainOdd" className="block text-sm font-medium text-gray-300">
                  Odd {mainBetType === 'back' ? 'Back' : 'Lay'}
                </label>
                <input
                  type="number"
                  id="mainOdd"
                  value={mainOdd}
                  onChange={(e) => setMainOdd(e.target.value)}
                  min="1.01"
                  step="0.01"
                  className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="mainStake" className="block text-sm font-medium text-gray-300">
                  Valor Apostado {mainBetType === 'back' ? 'Back' : 'Responsabilidade Lay'} (Stake)
                </label>
                <input
                  type="number"
                  id="mainStake"
                  value={mainStake}
                  onChange={(e) => setMainStake(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Seção da Aposta Oposta */}
          <div className="bg-gray-700 p-6 rounded-md shadow-inner">
            <h2 className={`text-xl font-semibold mb-4 ${mainBetType === 'back' ? 'text-red-400' : 'text-green-400'}`}>
              Aposta {mainBetType === 'back' ? 'LAY' : 'BACK'} (Para Cobrir)
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="oppositeOdd" className="block text-sm font-medium text-gray-300">
                  Odd {mainBetType === 'back' ? 'Lay' : 'Back'}
                </label>
                <input
                  type="number"
                  id="oppositeOdd"
                  value={oppositeOdd}
                  onChange={(e) => setOppositeOdd(e.target.value)}
                  min="1.01"
                  step="0.01"
                  className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md py-2 px-3 text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-300">
                  Valor Apostado {mainBetType === 'back' ? 'LAY' : 'BACK'} (Stake)
                </label>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {formatCurrency(oppositeStake)}
                </p>
                {mainBetType === 'back' && ( // A responsabilidade LAY só é relevante se a aposta principal for BACK
                  <p className="text-sm text-gray-400 mt-1">
                    Responsabilidade Lay: {formatCurrency(oppositeStake * (oppositeOdd - 1))}
                  </p>
                )}
                {mainBetType === 'lay' && ( // A responsabilidade LAY principal é o input do usuário
                  <p className="text-sm text-gray-400 mt-1">
                    Sua Responsabilidade LAY Principal: {formatCurrency(mainBetLiability)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Resultados */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4 text-yellow-300">Resultados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-300">
                Lucro se {mainBetType === 'back' ? 'BACK' : 'LAY'} Ganha
              </p>
              <p className={`text-xl font-bold ${profitMainBetWin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(profitMainBetWin)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">
                Lucro se {mainBetType === 'back' ? 'LAY' : 'BACK'} Ganha
              </p>
              <p className={`text-xl font-bold ${profitOppositeBetWin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(profitOppositeBetWin)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Lucro Geral</p>
              <p className={`text-2xl font-bold ${overallProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(overallProfit)}
              </p>
            </div>
            {mainBetType === 'lay' && ( // NOVO: Exibe a Stake Lay para Ganhar apenas quando o tipo principal é LAY
              <div className="md:col-span-3 mt-4"> {/* Ocupa 3 colunas para centralizar */}
                <p className="text-sm text-gray-300">Sua Stake LAY (para ganhar)</p>
                <p className="text-xl font-bold text-blue-400">
                  {formatCurrency(layStakeToWin)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
