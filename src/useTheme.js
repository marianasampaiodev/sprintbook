import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Guarda o tema ('light' | 'dark') e aplica no <html data-theme="...">
export function useTheme() {
  const [theme, setTheme] = useLocalStorage(
    'sprintbook:theme',
    // Primeira vez: segue o tema do sistema operacional
    () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    t => t === 'dark' || t === 'light' // só aceita valores válidos
  );

  // O CSS lê o atributo data-theme para trocar as cores
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}