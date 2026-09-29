// ── components/StreamingOutput.tsx ───────────────────────────────────────
import { useState, useEffect } from 'react';

interface Props {
  lines: string[];
  color: string;
  delays?: number[];
}

export function StreamingOutput({ lines, color, delays }: Props) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= lines.length) return;
    const delay = delays && delays[shown] !== undefined ? delays[shown] : 38 + Math.random() * 30;
    const t = setTimeout(() => setShown(s => s + 1), delay);
    return () => clearTimeout(t);
  }, [shown, lines.length, delays]);
  // Un <span> por línea en vez de `lines.slice(0, shown).join('\n')`:
  // el join rearmaba el string completo en cada tick (O(n²) sobre 100k
  // líneas) y React no tenía nada estable que reconciliar. Con keys, cada
  // tick agrega UN nodo y deja los anteriores intactos (P1 3.7).
  return (
    <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color }}>
      {lines.slice(0, shown).map((line, i) => (
        <span key={i}>{i > 0 ? '\n' : ''}{line}</span>
      ))}
    </pre>
  );
}
