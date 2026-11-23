import { useState, useEffect } from 'react';

// Funciona como useState, mas lê/grava automaticamente no localStorage
// isValid: função opcional que confere se o dado salvo tem o formato esperado
export function useLocalStorage(key, initial, isValid = () => true) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Só usa o dado salvo se não for null e tiver o formato certo
        if (parsed && isValid(parsed)) return parsed;
      }
    } catch { /* JSON inválido: ignora e cai nos dados iniciais */ }
    // Primeira vez (ou dado quebrado): aceita função ou valor direto
    return typeof initial === 'function' ? initial() : initial;
  });

  // Toda vez que o estado muda, grava de novo
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage cheio/bloqueado */ }
  }, [key, value]);

  return [value, setValue];
}