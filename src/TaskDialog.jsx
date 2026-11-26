import { useEffect, useRef, useState } from 'react';
import { COLS, resizeImage, TAGS, uid, today } from './utils';
import { PriorityFlag } from './TaskBadges';

// Só é renderizado quando há uma task aberta (task = {} para nova)
export default function TaskDialog({ task, sprints, defaultSprint, onSave, onDelete, onClose }) {
  const ref = useRef(null);
  const editing = !!task.id;
  const [imageError, setImageError] = useState('');
  const initialTag = (task.tag ?? '').trim();
  const normalizedTag = initialTag.toLowerCase();
  const hasPresetTag = Object.hasOwn(TAGS, normalizedTag);
  const [tagType, setTagType] = useState(() => (
    hasPresetTag ? normalizedTag : initialTag ? 'custom' : ''
  ));
  const [customTag, setCustomTag] = useState(() => (
    hasPresetTag ? '' : initialTag
  ));
  // Estado do formulário começa com os valores da task (ou padrões)
  const [f, setF] = useState({
    title: task.title ?? '', desc: task.desc ?? '', prio: task.prio ?? 'media',
    start_date: task.start_date ?? (task.id ? '' : today()), status: task.status ?? 'todo',
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
      ...task, ...f, title: f.title.trim(),
      tag: tagType === 'custom' ? customTag.trim() : tagType,
      image: f.image || null,
      id: task.id || uid(), created: task.created || today(), done_at: task.done_at ?? null,
    });
  };

  return (
    <dialog ref={ref} onClose={onClose}>
      <div className="dialog-heading">
        <span className="eyebrow">{editing ? 'ATUALIZE SUA TASK' : 'ADICIONE UMA NOVA ENTREGA'}</span>
        <h2>{editing ? 'Editar task' : 'Nova task'}</h2>
        <p>Defina prioridade, data e etapa para manter seu quadro organizado.</p>
      </div>
      <label>Título</label><input value={f.title} onChange={set('title')} autoFocus />
      <label>Descrição</label><textarea value={f.desc} onChange={set('desc')} />
      <div className="two">
        <div><label>Prioridade</label>
          <div className="priority-control">
            <select value={f.prio} onChange={set('prio')}>
              <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
            </select>
            <PriorityFlag priority={f.prio} />
          </div>
        </div>
        <div><label>Data de início</label>
          <input type="date" value={f.start_date} onChange={set('start_date')} /></div>
        <div><label>Etiqueta</label>
          <select value={tagType} onChange={e => setTagType(e.target.value)}>
            <option value="">Sem etiqueta</option>
            {Object.entries(TAGS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            <option value="custom">Personalizada</option>
          </select>
          {tagType === 'custom' && (
            <input aria-label="Etiqueta personalizada" value={customTag}
              onChange={e => setCustomTag(e.target.value)} placeholder="Digite uma etiqueta" />
          )}
        </div>
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