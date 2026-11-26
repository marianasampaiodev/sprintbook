import { br, PRIO, TAGS } from './utils';

export function PriorityFlag({ priority }) {
  const hasPriority = Object.hasOwn(PRIO, priority);
  const label = hasPriority ? PRIO[priority] : 'Sem prioridade';
  const priorityClass = hasPriority ? `priority-${priority}` : 'priority-unknown';

  return (
    <span className={`priority-flag ${priorityClass}`} title={`Prioridade ${label}`}>
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path d="M3 14V2m1 1c3-2 5 2 9 0v7c-4 2-6-2-9 0" />
      </svg>
      <span>{label}</span>
    </span>
  );
}

export function TagBadge({ tag }) {
  const normalizedTag = tag.trim().toLowerCase();
  const presetLabel = Object.hasOwn(TAGS, normalizedTag) ? TAGS[normalizedTag] : null;
  const tagClass = presetLabel ? `tag-${normalizedTag}` : 'tag-custom';

  return <span className={`chip ${tagClass}`}>{presetLabel || tag}</span>;
}

export function TaskDate({ date }) {
  return (
    <span className={`task-date${date ? '' : ' task-date-empty'}`}>
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path d="M3 3.5h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm-1 3h12M5 2v3m6-3v3" />
      </svg>
      {date ? <time dateTime={date}>{br(date)}</time> : 'Sem data'}
    </span>
  );
}
