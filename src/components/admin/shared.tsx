// ── components/admin/shared.tsx ─────────────────────────────────
// Constantes e iconos compartidos del panel de administración

export const MONO_FONT = "'Cascadia Code','Fira Code','Consolas',monospace";

export function ShieldIcon({ size = 14, stroke = 'black' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function LoadingView({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1015', fontFamily: MONO_FONT }}>
      <div className="text-emerald-400 font-mono text-sm animate-pulse">{text}</div>
    </div>
  );
}
