// ---------- Helpers de data ----------
const pad = n => String(n).padStart(2, '0');
export const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => fmt(new Date());
// Soma (ou subtrai) dias em uma data 'YYYY-MM-DD'
export const addDays = (s, n) => {
  const d = new Date(s + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return fmt(d);
};
// 'YYYY-MM-DD' -> 'DD/MM/YYYY'
export const br = s => (s ? s.split('-').reverse().join('/') : '');
export const uid = () => Math.random().toString(36).slice(2, 9);

// ---------- Constantes ----------
export const KEY = 'sprintbook:v1'; // chave do localStorage
export const COLS = [['todo', 'A fazer'], ['doing', 'Em andamento'], ['review', 'Em review'], ['done', 'Feito']];
export const PRIO = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
export const TABS = [['board', 'Board'], ['backlog', 'Backlog'], ['daily', 'Daily'], ['today', 'Hoje'], ['hist', 'Histórico']];
// Garante que done_at só existe quando a task está em "Feito"
export const withDone = t => ({ ...t, done_at: t.status === 'done' ? t.done_at || today() : null });

// ---------- Dados de exemplo (só usados na 1ª vez que abrir) ----------
export function seed() {
  const t = today();
  const sprint = { id: 's1', name: 'Sprint 1', goal: 'Entregar o fluxo de login e o painel inicial', start: addDays(t, -4), end: addDays(t, 9), closed: false };
  const mk = (title, status, prio, pts, tag, sp = 's1') => ({
    id: uid(), title, desc: '', status, prio, pts, tag, sprint: sp,
    created: addDays(t, -4), done_at: status === 'done' ? addDays(t, -1) : null,
  });
  return {
    sprints: [sprint], cur: 's1', view: 'board', dailies: {},
    tasks: [
      mk('Configurar pipeline de CI', 'done', 'media', 3, 'devops'),
      mk('Tela de login com validação', 'doing', 'alta', 5, 'frontend'),
      mk('Endpoint de recuperação de senha', 'todo', 'alta', 5, 'backend'),
      mk('Revisar PR do módulo de relatórios', 'review', 'media', 2, 'review'),
      mk('Corrigir bug no filtro de datas', 'todo', 'baixa', 1, 'bug'),
      mk('Pesquisar biblioteca de gráficos', 'todo', 'baixa', 2, 'spike', ''), // sem sprint = backlog
    ],
  };
}