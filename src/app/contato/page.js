// src/app/aulas/page.js - SEM VÍDEOS, COM REDES SOCIAIS E E-MAIL

"use client";

import Link from 'next/link';
// NOVO: Importa os ícones das redes sociais
import { FaFacebook, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa'; 

export default function AulasPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Nossas Aulas</h1>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Voltar para Palpites
          </Link>
        </div>

        {/* Texto introdutório justificado */}
        <p className="text-gray-300 mb-8 text-justify">
          Aprenda os melhores métodos e estratégias para suas apostas.
        </p>

        {/* Bloco de Texto Descritivo Longo 1 (Sobre Tipsgolbr) */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Descubra o Caminho para o Sucesso com Tipsgolbr</h2>
            <p className="text-gray-300 mb-4 text-base leading-relaxed text-justify">
                Em um cenário onde a paixão pelo esporte se entrelaça com o desejo de alcançar o sucesso financeiro, apresentamos a Tipsgolbr, sua parceira ideal no universo das apostas esportivas. Com uma proposta inovadora e comprometida com a excelência, somos a ponte que conecta os entusiastas esportivos ao mundo das oportunidades lucrativas.
            </p>
            <p className="text-gray-300 mb-4 text-base leading-relaxed text-justify">
                Na Tipsgolbr, compreendemos que a confiança é a base de qualquer relacionamento sólido. Eu que sou um apaixonado por esportes e dedicados a analisar minuciosamente cada evento esportivo. Esta combinação de paixão e experiência me permite fornecer as melhores dicas e insights, ajudando nossos seguidores a tomarem decisões informadas nas apostas.
            </p>
            <p className="text-gray-300 mb-4 text-base leading-relaxed text-justify">
                Invisto constantemente em tecnologia de ponta para oferecer uma análise mais eficiênte. Nossos seguidores desfrutam de uma experiência de apostas sem complicações, com acesso a estatísticas atualizadas, previsões com 90% precisas e ferramentas analíticas avançadas. Na Tipsgolbr, a tecnologia está a serviço da sua vantagem competitiva.
            </p>
            <p className="text-gray-300 text-base leading-relaxed text-justify">
                Ao escolher a Tipsgolbr, você não apenas obtém dicas valiosas, mas também faz parte de uma comunidade vibrante de apostadores dedicados. Nosso canal do youtube e Telegram oferece dicas interativas. É mais do que plataformas de apostas e consultas; é uma comunidade onde os vencedores estão sempre atentos as novidades do mercado do Futebol e das apostas esportivas.
            </p>
        </div>

        {/* Imagem de separação entre textos */}
        <img
          src="/images/dicas-aposta.jpg" // SUBSTITUA PELO NOME DA SUA IMAGEM
          alt="Dicas de Apostas Esportivas"
          className="w-full h-auto rounded-md my-8 shadow-lg"
        />

        {/* Bloco de Texto Descritivo Longo 2 (sobre dicas) */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Aumente suas chances de sucesso nas Apostas Esportivas</h2>
            <p className="text-gray-300 mb-4 text-base leading-relaxed text-justify">
                As apostas esportivas envolvem uma combinação de análise e estratégia. Não há garantia de vitória, mas algumas abordagens podem aumentar suas chances de sucesso. Aqui estão algumas dicas:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4 text-justify">
                <li><strong>Conhecimento Esportivo:</strong> Esteja bem informado sobre os esportes nos quais você está apostando. Analise estatísticas, desempenho passado e notícias recentes.</li>
                <li><strong>Gestão de Banca:</strong> Estabeleça um orçamento dedicado às apostas e evite ultrapassá-lo. Faça apostas fracionadas do seu capital para minimizar riscos.</li>
                <li><strong>Estratégia de Aposta:</strong> Escolha um sistema de apostas que se adapte ao seu estilo, como o martingale ou o método de Kelly. Diversifique suas apostas em diferentes eventos e mercados para reduzir riscos.</li>
                <li><strong>Compreensão das Odds:</strong> Compare as probabilidades oferecidas por diferentes casas de apostas para encontrar o melhor valor. Entenda como as probabilidades funcionam e como elas refletem as chances reais de um evento.</li>
                <li><strong>Controle Emocional:</strong> Evite decisões impulsivas e emocionais. Mantenha a disciplina, mesmo em caso de perdas.</li>
                <li><strong>Análise de Lesões e Notícias:</strong> Esteja ciente de lesões, suspensões e outras notícias relevantes que possam afetar o desempenho de uma equipe.</li>
                <li><strong>Apostas ao Vivo:</strong> Considere apostas ao vivo para reagir às mudanças no jogo e nas probabilidades.</li>
                <li><strong>Compreensão das Modalidades de Apostas:</strong> Familiarize-se com os diferentes tipos de apostas, como handicap, over/under e apostas de propostas.</li>
                <li><strong>Aprender com as Perdas:</strong> Analise suas apostas anteriores para aprender com os erros. Faça ajustes na sua estratégia conforme necessário.</li>
                <li><strong>Manter-se Atualizado:</strong> Acompanhe as tendências e evoluções no mundo dos esportes e das apostas.</li>
            </ul>
            <p className="text-gray-300 text-base leading-relaxed text-justify">
                Lembre-se de que não há garantias nas apostas esportivas, e o jogo responsável é fundamental. As apostas devem ser feitas de forma consciente, com o entendimento de que você pode perder o dinheiro apostado.
            </p>
        </div>

        {/* Imagem de separação entre textos */}
        <img
          src="/images/maiores.jpg" // SUBSTITUA PELO NOME DA SUA IMAGEM
          alt="Dicas de Apostas Esportivas"
          className="w-full h-auto rounded-md my-8 shadow-lg"
        />

        {/* NOVO: Seção de Redes Sociais e E-mail */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Conecte-se Conosco!</h2>
          <p className="text-gray-300 mb-6">
            Siga-nos em nossas redes sociais para ficar por dentro de todas as novidades, dicas e interações:
          </p>
          <div className="flex space-x-8 justify-center mb-4"> {/* Centraliza os ícones, mb-4 para espaçar email */}
            <a href="https://www.facebook.com/tipsgolbr/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 text-5xl transition-colors">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/tipsgolbr/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 text-5xl transition-colors">
              <FaInstagram />
            </a>
            <a href="https://t.me/grupotipsgolbr" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 text-5xl transition-colors">
              <FaTelegramPlane />
            </a>
            <a href="https://www.youtube.com/@Tipsgolbr" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 text-5xl transition-colors">
              <FaYoutube />
            </a>
          </div>
          <p className="text-gray-300 text-center text-lg">
            E-mail: <a href="mailto:tipsgolbr@gmail.com" className="text-blue-400 hover:underline">tipsgolbr@gmail.com</a>
          </p>
        </div>


        {/* Contêiner para o Grid de Aulas (era onde os vídeos estavam) */}
        {/* AGORA VAZIO, POIS OS VÍDEOS FORAM REMOVIDOS */}
        {/* Se você quiser adicionar outros tipos de conteúdo aqui depois, pode fazer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* REMOVIDOS: Seus blocos de aula anteriores com iframes/vídeos */}
          {/* Se você quiser algo mais aqui, duplique os div bg-gray-800 e adicione conteúdo sem vídeos */}

        </div> {/* Fim do contêiner grid */}

      </div>
    </div>
  );
}