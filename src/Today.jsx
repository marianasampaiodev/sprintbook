import { useState } from 'react';
import { today, br, uid } from './utils';
import { TaskDate } from './TaskBadges';

export default function Today({ S, onAdd, onRemove }) {
  const [date, setDate] = useState(today()); // dia que está sendo visto
  const [text, setText] = useState('');       // texto do input

  const entries = (S.log || {})[date] || [];                       // anotações manuais do dia
  const doneTasks = S.tasks.filter(t => t.done_at === date);       // tasks concluídas no dia (automático)

  // Adiciona a anotação e limpa o campo
  const add = () => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    onAdd(date, { id: uid(), text: text.trim(), time });
    setText('');
  };

  return (
    <div className="grid2">
      <div className="panel">
        <h3>Coisas que fiz em {br(date)}</h3>
        <input type="date" value={date} onChange={e => setDate(e.target.value || today())} style={{ width: 'auto' }} />

        {/* Campo para anotar: Enter também adiciona */}
        <label>O que você fez?</label>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()} placeholder="ex: estudei hooks do React" />
          <button className="btn pri" onClick={add}>Adicionar</button>
        </div>

        <div className="list" style={{ marginTop: 14 }}>
          {entries.length === 0 && <div className="empty">Nenhuma anotação neste dia.</div>}
          {entries.map(en => (
            <div className="item" key={en.id}>
              <span>{en.text} <span className="muted" style={{ fontSize: 12 }}>· {en.time}</span></span>
              <button className="btn danger" onClick={() => onRemove(date, en.id)}>Remover</button>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks concluídas aparecem sozinhas, sem precisar digitar */}
      <div className="panel" style={{ alignSelf: 'start' }}>
        <h3>Tasks concluídas ({doneTasks.length})</h3>
        {doneTasks.length === 0
          ? <div className="muted" style={{ fontSize: 14 }}>Nada concluído neste dia.</div>
          : doneTasks.map(t => <div className="sug" key={t.id}><span>{t.title}</span><TaskDate date={t.start_date} /></div>)}
      </div>
    </div>
  );
}