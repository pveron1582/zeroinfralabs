// ── components/StreamingOutput.tsx ───────────────────────────────────────
import React, { useState, useEffect } from 'react';

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
  return (
    <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color }}>
      {lines.slice(0, shown).join('\n')}
    </pre>
  );
}
