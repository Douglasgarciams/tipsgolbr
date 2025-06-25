// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TipsGolBR - Palpites de Futebol",
  description: "Sua fonte diária de palpites e dicas para apostas em futebol.",
};

export default function RootLayout({ children }) {
  // ADICIONE ESTA LINHA:
  console.log('LAYOUT.JS: Aplicativo Next.js foi iniciado no Render!'); 

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}