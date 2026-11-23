// ---------- Imports (sempre no topo, fora da função) ----------
import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTheme } from './useTheme';
import TaskDialog from './TaskDialog';
import SprintDialog from './SprintDialog';
import Daily from './Daily';
import Today from './Today';
import { KEY, COLS, PRIO, TABS, seed, today, br, withDone } from './utils';

export default function App() {
  // Estado global (sprints, tasks, dailies, log), salvo automaticamente no localStorage.
  // O 3º argumento confere se o dado salvo tem o formato certo; se não tiver, usa o seed.
  const [S, setS] = useLocalStorage(
    KEY,
    seed,
    d => Array.isArray(d.sprints) && Array.isArray(d.tasks) && d.dailies && typeof d.dailies === 'object'
  );
  const [theme, toggleTheme] = useTheme();         // tema atual + função para alternar
  const [taskDlg, setTaskDlg] = useState(null);     // null = fechado | {} = nova | task = editar
  const [sprintDlg, setSprintDlg] = useState(false); // modal de nova sprint
  const [overCol, setOverCol] = useState(null);     // coluna destacada durante o drag

  // Sprint selecionada e as tasks dela
  const sprint = S.sprints.find(s => s.id === S.cur);
  const tasks = S.tasks.filter(t => t.sprint === S.cur);

  // ---------- Ações ----------

  // Move a task para outra coluna (e ajusta a data de conclusão)
  const moveTask = (id, status) =>
    setS(p => ({ ...p, tasks: p.tasks.map(t => (t.id === id ? withDone({ ...t, status }) : t)) }));

  // Cria ou atualiza uma task
  const saveTask = task => {
    const t = withDone(task);
    setS(p => ({
      ...p,
      tasks: p.tasks.some(x => x.id === t.id)
        ? p.tasks.map(x => (x.id === t.id ? t : x)) // já existe: atualiza
        : [...p.tasks, t],                           // nova: adiciona
    }));
    setTaskDlg(null);
  };

  // Exclui uma task
  const deleteTask = id => {
    setS(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== id) }));
    setTaskDlg(null);
  };

  // Leva uma task do backlog para a sprint atual
  const pullToSprint = id =>
    setS(p => ({ ...p, tasks: p.tasks.map(t => (t.id === id ? { ...t, sprint: p.cur, status: 'todo' } : t)) }));

  // Cria uma sprint e já seleciona ela
  const saveSprint = s => {
    setS(p => ({ ...p, sprints: [...p.sprints, s], cur: s.id, view: 'board' }));
    setSprintDlg(false);
  };

  // Encerra a sprint: tasks não concluídas voltam pro backlog
  const closeSprint = () => {
    const open = tasks.filter(t => t.status !== 'done');
    const msg = open.length
      ? `Encerrar a sprint? ${open.length} task(s) não concluída(s) voltam para o backlog.`
      : 'Encerrar a sprint?';
    if (!confirm(msg)) return;
    setS(p => ({
      ...p,
      tasks: p.tasks.map(t => (t.sprint === p.cur && t.status !== 'done' ? { ...t, sprint: '', status: 'todo' } : t)),
      sprints: p.sprints.map(s => (s.id === p.cur ? { ...s, closed: true } : s)),
    }));
  };

  // Atualiza um campo da daily de uma data
  const setDailyField = (date, field, value) =>
    setS(p => ({ ...p, dailies: { ...p.dailies, [date]: { ...(p.dailies[date] || {}), [field]: value } } }));

  // Anotações da aba "Hoje". S.log pode não existir em dados antigos, por isso o "|| {}"
  const addLog = (date, entry) =>
    setS(p => ({ ...p, log: { ...(p.log || {}), [date]: [...((p.log || {})[date] || []), entry] } }));
  const removeLog = (date, id) =>
    setS(p => ({ ...p, log: { ...(p.log || {}), [date]: ((p.log || {})[date] || []).filter(e => e.id !== id) } }));

  // ---------- Barra da sprint (progresso) ----------
  // Soma os pontos das tasks por status ('all' = todas)
  const pts = st => tasks.filter(t => st === 'all' || t.status === st).reduce((a, t) => a + t.pts, 0);
  const total = pts('all');
  const done = pts('done');
  const pct = total ? Math.round((done / total) * 100) : 0;
  // Dias restantes até o fim da sprint
  const left = sprint ? Math.ceil((new Date(sprint.end + 'T12:00:00') - new Date(today() + 'T12:00:00')) / 864e5) : 0;
  const dayTxt = sprint?.closed ? 'Sprint encerrada'
    : left >= 0 ? `${left} dia${left === 1 ? '' : 's'} restante${left === 1 ? '' : 's'}`
    : `Atrasada ${-left} dia${left === -1 ? '' : 's'}`;

  // ---------- View: Board (colunas com cards arrastáveis) ----------
  const board = (
    <div className="board">
      {COLS.map(([k, label]) => {
        const col = tasks.filter(t => t.status === k);
        return (
          <div key={k} className={`col${overCol === k ? ' over' : ''}`}
            onDragOver={e => { e.preventDefault(); setOverCol(k); }}
            onDragLeave={() => setOverCol(null)}
            onDrop={e => { e.preventDefault(); setOverCol(null); moveTask(e.dataTransfer.getData('text/plain'), k); }}>
            <h3>{label}<span>{col.length}</span></h3>
            {col.length === 0 && <div className="empty">Arraste uma task para cá</div>}
            {col.map(t => {
              const i = COLS.findIndex(c => c[0] === t.status); // posição da coluna atual
              return (
                <div key={t.id} className={`card p-${t.prio}`} draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', t.id)}>
                  <div className="t" onClick={() => setTaskDlg(t)}>{t.title}</div>
                  <div className="m">
                    <span>{t.tag && <span className="chip">{t.tag}</span>} {t.pts} pt{t.pts > 1 ? 's' : ''} · {PRIO[t.prio]}</span>
                    <span className="row" style={{ gap: 4 }}>
                      {/* Botões ‹ › para mover sem arrastar (úteis no celular) */}
                      <button className="mv" disabled={i === 0} aria-label="Coluna anterior" onClick={() => moveTask(t.id, COLS[i - 1][0])}>‹</button>
                      <button className="mv" disabled={i === COLS.length - 1} aria-label="Próxima coluna" onClick={() => moveTask(t.id, COLS[i + 1][0])}>›</button>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  // ---------- View: Backlog (tasks sem sprint) ----------
  const backlogItems = S.tasks.filter(t => !t.sprint);
  const backlog = (
    <>
      <h2 style={{ fontSize: 20, marginBottom: 10 }}>Backlog ({backlogItems.length})</h2>
      <div className="list">
        {backlogItems.length === 0 && <div className="empty">Backlog vazio. Novas ideias e demandas sem sprint aparecem aqui.</div>}
        {backlogItems.map(t => (
          <div className="item" key={t.id}>
            <div>
              <div className="t" onClick={() => setTaskDlg(t)}>{t.title}</div>
              <div className="muted" style={{ fontSize: 13 }}>{t.tag && `${t.tag} · `}{t.pts} pts · prioridade {PRIO[t.prio].toLowerCase()}</div>
            </div>
            {/* Só mostra o botão se existir uma sprint aberta */}
            {sprint && !sprint.closed && <button className="btn" onClick={() => pullToSprint(t.id)}>Levar para {sprint.name}</button>}
          </div>
        ))}
      </div>
    </>
  );

  // ---------- View: Histórico (tasks concluídas agrupadas por sprint) ----------
  const doneTasks = S.tasks.filter(t => t.status === 'done');
  const groups = [...S.sprints].reverse()
    .map(s => ({ name: s.name, t: doneTasks.filter(t => t.sprint === s.id) }))
    .concat([{ name: 'Sem sprint', t: doneTasks.filter(t => !t.sprint || !S.sprints.some(s => s.id === t.sprint)) }])
    .filter(g => g.t.length); // esconde grupos vazios
  const hist = groups.length === 0
    ? <div className="empty">Nada concluído ainda. Tasks marcadas como Feito aparecem aqui.</div>
    : groups.map(g => (
      <div key={g.name} style={{ marginBottom: 22 }}>
        <h3 className="h-sprint">{g.name} <span className="muted" style={{ fontSize: 14, fontWeight: 500 }}>{g.t.length} tasks · {g.t.reduce((a, t) => a + t.pts, 0)} pts</span></h3>
        <div className="list">
          {[...g.t].sort((a, b) => (b.done_at || '').localeCompare(a.done_at || '')).map(t => (
            <div className="item" key={t.id}>
              <span className="t" onClick={() => setTaskDlg(t)}>{t.title}</span>
              <span className="muted" style={{ fontSize: 13 }}>{t.tag && `${t.tag} · `}{t.pts} pts · feito em {br(t.done_at) || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    ));

  // Mapa: nome da aba -> conteúdo (as chaves vêm de TABS no utils.js)
  const views = {
    board,
    backlog,
    daily: <Daily S={S} onField={setDailyField} />,
    today: <Today S={S} onAdd={addLog} onRemove={removeLog} />,
    hist,
  };

  // ---------- Tela ----------
  return (
    <div className="wrap">
      <header className="top">
        <h1 className="brand">Sprintbook</h1>
        <div className="row">
          {/* Seletor de sprint */}
          <select aria-label="Sprint atual" style={{ width: 'auto' }} value={S.cur}
            onChange={e => setS(p => ({ ...p, cur: e.target.value }))}>
            {S.sprints.map(s => <option key={s.id} value={s.id}>{s.name}{s.closed ? ' (encerrada)' : ''}</option>)}
          </select>
          {/* Alterna entre tema claro e escuro */}
          <button className="btn" onClick={toggleTheme} aria-label="Alternar tema">
            {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
          </button>
          <button className="btn" onClick={() => setSprintDlg(true)}>Nova sprint</button>
          <button className="btn pri" onClick={() => setTaskDlg({})}>Nova task</button>
        </div>
      </header>

      {/* Resumo e progresso da sprint */}
      <section className="sprintbar">
        {!sprint ? <div className="empty">Crie uma sprint para começar a organizar suas tasks.</div> : (
          <>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div><h2 style={{ fontSize: 19 }}>{sprint.name}</h2><div className="muted">{sprint.goal || 'Sem objetivo definido'}</div></div>
              {!sprint.closed && <button className="btn" onClick={closeSprint}>Encerrar sprint</button>}
            </div>
            {/* Barra: verde = feito, amarelo = review, azul = em andamento */}
            <div className="bar" title={`${pct}% concluído`}>
              <i style={{ width: `${total ? (pts('done') / total) * 100 : 0}%`, background: 'var(--ok)' }} />
              <i style={{ width: `${total ? (pts('review') / total) * 100 : 0}%`, background: 'var(--warn)' }} />
              <i style={{ width: `${total ? (pts('doing') / total) * 100 : 0}%`, background: 'var(--accent)' }} />
            </div>
            <div className="meta">
              <span><b>{done}</b> de {total} pontos ({pct}%)</span>
              <span>{tasks.filter(t => t.status === 'done').length}/{tasks.length} tasks</span>
              <span>{br(sprint.start)} a {br(sprint.end)}</span>
              <span>{dayTxt}</span>
            </div>
          </>
        )}
      </section>

      {/* Abas */}
      <nav className="tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} className="tab" role="tab" aria-selected={S.view === k}
            onClick={() => setS(p => ({ ...p, view: k }))}>{l}</button>
        ))}
      </nav>

      {/* Conteúdo da aba selecionada */}
      <main>{views[S.view]}</main>

      {/* Modais: só existem enquanto estiverem abertos */}
      {taskDlg && (
        <TaskDialog key={taskDlg.id || 'new'} task={taskDlg} sprints={S.sprints} defaultSprint={S.cur || ''}
          onSave={saveTask} onDelete={deleteTask} onClose={() => setTaskDlg(null)} />
      )}
      {sprintDlg && (
        <SprintDialog nextNumber={S.sprints.length + 1} onSave={saveSprint} onClose={() => setSprintDlg(false)} />
      )}
    </div>
  );
}