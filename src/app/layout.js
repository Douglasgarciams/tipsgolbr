// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script'; // 1. IMPORTAR O COMPONENTE SCRIPT

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TipsGolBR - Palpites de Futebol",
  description: "Sua fonte diária de palpites e dicas para apostas em futebol.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-900`}>
        
        {/* 👇 2. SEU CÓDIGO DO ADSENSE ADICIONADO AQUI 👇 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7310899798938443"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {children}
      </body>
    </html>
  );
}