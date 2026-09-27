// ── components/appContent/MobileKeyRow.tsx ────────────────────────
// Fila de teclas rápidas para la terminal móvil (Tab, pipes, Ctrl+C…).

export function MobileKeyRow({ onInsert }: { onInsert: (text: string) => void }) {
  const keys = [
    { label: 'Tab', insert: '\t' },
    { label: '|', insert: ' | ' },
    { label: '-', insert: '-' },
    { label: '/', insert: '/' },
    { label: '--', insert: '--' },
    { label: 'Ctrl+C', insert: '__CTRL_C__' },
    { label: '↑', insert: '__ARROW_UP__' },
    { label: 'clear', insert: 'clear' },
  ];
  return (
    <div className="flex items-center gap-1.5 px-2 py-2 border-t border-gray-800 bg-gray-900 overflow-x-auto scrollbar-thin flex-shrink-0">
      {keys.map(k => (
        <button
          key={k.label}
          type="button"
          onClick={() => onInsert(k.insert)}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-mono text-gray-300 active:bg-gray-700 active:scale-95 transition-all"
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}
