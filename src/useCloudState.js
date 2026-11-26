import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';

const TABLE = 'sprintbook_state';

// Funciona como useState, mas carrega e grava no Supabase.
// Devolve [valor, setValor, status]. valor = null enquanto carrega.
// status: 'loading' | 'saving' | 'saved' | 'error'
export function useCloudState(userId, legacyKey, initial, isValid) {
  const [value, setValue] = useState(null);
  const [status, setStatus] = useState('loading');
  const latest = useRef(null);    // último valor, para o envio
  const baseline = useRef(null);  // valor carregado (não precisa ser regravado)
  const dirty = useRef(false);    // true = tem mudança ainda não enviada

  // Envia o valor atual para o Supabase (cria a linha ou atualiza)
  const save = useCallback(async () => {
    if (!dirty.current) return;
    dirty.current = false;
    setStatus('saving');
    const { error } = await supabase.from(TABLE).upsert({
      user_id: userId, data: latest.current, updated_at: new Date().toISOString(),
    });
    if (error) { dirty.current = true; setStatus('error'); }   // tenta de novo na próxima mudança
    else if (!dirty.current) setStatus('saved');                // se mudou durante o envio, o próximo ciclo cuida
  }, [userId]);

  // 1) Carregar ao abrir
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: row, error } = await supabase
        .from(TABLE).select('data').eq('user_id', userId).maybeSingle();
      if (cancelled) return;

      // Segurança: se falhou ao ler OU o dado salvo é estranho, NÃO sobrescreve nada
      if (error || (row && !isValid(row.data))) { setStatus('error'); return; }

      let start = row?.data;
      if (!row) {
        // Primeira vez na nuvem: aproveita o que estava no localStorage deste navegador
        try {
          const local = JSON.parse(localStorage.getItem(legacyKey));
          if (local && isValid(local)) start = local;
        } catch { /* sem dados locais */ }
        // Se também não tinha, usa os dados de exemplo
        if (!start) start = typeof initial === 'function' ? initial() : initial;
        dirty.current = true; // precisa criar a linha
      }

      latest.current = start;
      baseline.current = start;
      setValue(start);
      if (dirty.current) save(); else setStatus('saved');
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 2) Gravar quando o valor muda (espera 800 ms sem mudanças para não enviar a cada tecla)
  useEffect(() => {
    if (value === null || value === baseline.current) return; // carregando ou sem mudança
    latest.current = value;
    dirty.current = true;
    const t = setTimeout(save, 800);
    return () => clearTimeout(t); // cada mudança reinicia o relógio
  }, [value, save]);

  // 3) Ao esconder a aba ou trocar de app, envia na hora o que faltar
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') save(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [save]);

  return [value, setValue, status];
}