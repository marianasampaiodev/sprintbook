import { useEffect, useRef, useState } from 'react';
import { COLS, resizeImage, uid, today } from './utils';

// Só é renderizado quando há uma task aberta (task = {} para nova)
export default function TaskDialog({ task, sprints, defaultSprint, onSave, onDelete, onClose }) {
  const ref = useRef(null);
  const editing = !!task.id;
  const [imageError, setImageError] = useState('');
  // Estado do formulário começa com os valores da task (ou padrões)
  const [f, setF] = useState({
    title: task.title ?? '', desc: task.desc ?? '', prio: task.prio ?? 'media',
    pts: task.pts ?? 3, tag: task.tag ?? '', status: task.status ?? 'todo',
    sprint: task.sprint ?? defaultSprint, image: task.image ?? '',
  });
  const set = k => e => setF(current => ({ ...current, [k]: e.target.value }));

  // Abre o <dialog> nativo assim que o componente aparece
  useEffect(() => { ref.current.showModal(); }, []);

  const pickImage = async e => {
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Selecione um arquivo de imagem.');
      return;
    }
    setImageError('');
    try {
      const image = await resizeImage(file);
      setF(current => ({ ...current, image }));
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Não foi possível processar a imagem.');
    }
  };

  const save = () => {
    if (!f.title.trim()) return;
    onSave({
      ...task, ...f, title: f.title.trim(), tag: f.tag.trim(), pts: +f.pts,
      image: f.image || null,
      id: task.id || uid(), created: task.created || today(), done_at: task.done_at ?? null,
    });
  };

  return (
    <dialog ref={ref} onClose={onClose}>
      <h2>{editing ? 'Editar task' : 'Nova task'}</h2>
      <label>Título</label><input value={f.title} onChange={set('title')} autoFocus />
      <label>Descrição</label><textarea value={f.desc} onChange={set('desc')} />
      <div className="two">
        <div><label>Prioridade</label>
          <select value={f.prio} onChange={set('prio')}>
            <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
          </select></div>
        <div><label>Pontos</label>
          <select value={f.pts} onChange={set('pts')}>{[1, 2, 3, 5, 8, 13].map(n => <option key={n}>{n}</option>)}</select></div>
        <div><label>Etiqueta</label><input value={f.tag} onChange={set('tag')} placeholder="ex: backend, bug" /></div>
        <div><label>Status</label>
          <select value={f.status} onChange={set('status')}>{COLS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      </div>
      <label>Sprint</label>
      <select value={f.sprint} onChange={set('sprint')}>
        <option value="">Backlog (sem sprint)</option>
        {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <label>Anexo (imagem)</label>
      {f.image && (
        <div style={{ marginBottom: 8 }}>
          <img
            src={f.image}
            alt="Prévia do anexo"
            style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }}
          />
          <button
            type="button"
            className="btn danger"
            style={{ marginTop: 6 }}
            onClick={() => setF(current => ({ ...current, image: '' }))}
          >
            Remover imagem
          </button>
        </div>
      )}
      <input type="file" accept="image/*" onChange={pickImage} />
      {imageError && <div role="alert" style={{ color: 'var(--bad)', fontSize: 14 }}>{imageError}</div>}
      <div className="row" style={{ marginTop: 18, justifyContent: 'space-between' }}>
        {editing ? <button className="btn danger" onClick={() => confirm('Excluir esta task?') && onDelete(task.id)}>Excluir</button> : <span />}
        <div className="row">
          <button className="btn" onClick={() => ref.current.close()}>Cancelar</button>
          <button className="btn pri" onClick={save}>Salvar task</button>
        </div>
      </div>
    </dialog>
  );
}