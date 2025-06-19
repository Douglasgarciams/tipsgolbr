// src/components/FormattedDate.js
"use client";

import { useState, useEffect } from 'react';

export default function FormattedDate({ isoDate }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Esta função só roda no navegador, nunca no servidor.
    if (isoDate) {
      setFormattedDate(new Date(isoDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
    }
  }, [isoDate]);

  // No render inicial do servidor, não mostra nada.
  // Só mostra a data depois que o componente "monta" no cliente.
  return <>{formattedDate}</>;
}