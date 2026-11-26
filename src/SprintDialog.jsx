import { useEffect, useRef, useState } from 'react';
import { today, addDays, uid } from './utils';

export default function SprintDialog({ nextNumber, onSave, onClose }) {
  const ref = useRef(null);
  const [f, setF] = useState({ name: `Sprint ${nextNumber}`, goal: '', start: today(), end: addDays(today(), 13) });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  useEffect(() => { ref.current.showModal(); }, []);

  return (
    <dialog ref={ref} onClose={onClose}>
      <div className="dialog-heading">
        <span className="eyebrow">NOVO CICLO DE TRABALHO</span>
        <h2>Nova sprint</h2>
        <p>Escolha um objetivo e o período para sua próxima entrega.</p>
      </div>
      <label>Nome</label><input value={f.name} onChange={set('name')} />
      <label>Objetivo</label><textarea style={{ minHeight: 60 }} value={f.goal} onChange={set('goal')} />
      <div className="two">
        <div><label>Início</label><input type="date" value={f.start} onChange={set('start')} /></div>
        <div><label>Fim</label><input type="date" value={f.end} onChange={set('end')} /></div>
      </div>
      <div className="row" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => ref.current.close()}>Cancelar</button>
        <button className="btn pri" onClick={() => f.name.trim() && onSave({ ...f, name: f.name.trim(), id: uid(), closed: false })}>Criar sprint</button>
      </div>
    </dialog>
  );
}