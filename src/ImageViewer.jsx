import { useEffect, useRef } from 'react';

export default function ImageViewer({ src, title, onClose }) {
  const ref = useRef(null);

  useEffect(() => { ref.current.showModal(); }, []);

  return (
    <dialog
      ref={ref}
      className="viewer"
      onClose={onClose}
      onClick={() => ref.current.close()}
    >
      <button type="button" className="x" aria-label="Fechar">✕</button>
      <img src={src} alt={title} />
      <div className="cap">{title}</div>
    </dialog>
  );
}
