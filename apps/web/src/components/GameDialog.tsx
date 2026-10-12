import React, { useEffect, useRef } from 'react';
export const GameDialog = ({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); }; }, []);
  return <dialog className="game-dialog" ref={ref} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }}>{children}</dialog>;
};
