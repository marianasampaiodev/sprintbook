import { useState } from 'react';
import { today, addDays, br } from './utils';

// Lista de sugestões (tasks) com botão "Inserir"
function Suggestions({ items, onInsert }) {
  if (!items.length) return <div className="muted" style={{ fontSize: 14 }}>Nada por aqui.</div>;
  return items.map(t => (
    <div className="sug" key={t.id}>
      <span>{t.title}</span>
      <button className="btn" onClick={() => onInsert(t.title)}>Inserir</button>
    </div>
  ));
}

export default function Daily({ S, onField }) {
  const [date, setDate] = useState(today()); // data da daily em edição
  const entry = S.dailies[date] || {};
  const doneYesterday = S.tasks.filter(t => t.done_at === addDays(date, -1));
  const doing = S.tasks.filter(t => t.status === 'doing');
  const past = Object.keys(S.dailies).filter(k => k !== date).sort().reverse().slice(0, 6);

  // Acrescenta "- título" no final do campo
  const insert = (field, text) => {
    const cur = entry[field] || '';
    onField(date, field, cur + (cur && !cur.endsWith('\n') ? '\n' : '') + '- ' + text + '\n');
  };

  return (
    <>
      <div className="grid2">
        <div className="panel">
          <h3>Daily de {br(date)}</h3>
          <input type="date" value={date} onChange={e => setDate(e.target.value || today())} style={{ width: 'auto' }} />
          <label>O que fiz ontem</label>
          <textarea value={entry.yesterday || ''} onChange={e => onField(date, 'yesterday', e.target.value)} />
          <label>O que vou fazer hoje</label>
          <textarea value={entry.today || ''} onChange={e => onField(date, 'today', e.target.value)} />
          <label>Bloqueios</label>
          <textarea value={entry.blockers || ''} onChange={e => onField(date, 'blockers', e.target.value)} />
          <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>Salvo automaticamente.</div>
        </div>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div className="panel"><h3>Concluídas ontem</h3><Suggestions items={doneYesterday} onInsert={t => insert('yesterday', t)} /></div>
          <div className="panel"><h3>Em andamento</h3><Suggestions items={doing} onInsert={t => insert('today', t)} /></div>
        </div>
      </div>

      {past.length > 0 && (
        <>
          <h3 style={{ margin: '22px 0 10px' }}>Dailies anteriores</h3>
          <div className="list">
            {past.map(k => {
              const x = S.dailies[k];
              return (
                <div className="panel" key={k}>
                  <b>{br(k)}</b>
                  <div className="muted" style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{x.today || x.yesterday || '(vazio)'}</div>
                  {x.blockers && <div style={{ color: 'var(--bad)', fontSize: 14, whiteSpace: 'pre-wrap' }}>Bloqueio: {x.blockers}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}