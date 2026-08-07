// ── components/PdfReader.tsx ──────────────────────────────────────
// Lector PDF de escritorio (estilo aplicación inventada "ZeroPDF").
// Muestra el manual de uso del simulador en una ventana del escritorio.

const MANUAL_PATH = '/docs/manual.pdf';
const MANUAL_EN_PATH = '/docs/manual-en.pdf';

interface PdfReaderProps {
  isEs?: boolean;
}

export function PdfReader({ isEs }: PdfReaderProps) {
  const manualPath = isEs ? MANUAL_PATH : MANUAL_EN_PATH;
  const manualName = isEs ? 'manual.pdf' : 'manual-en.pdf';
  return (
    <div className="flex flex-col h-full bg-slate-950" data-testid="pdf-reader">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900 text-xs text-slate-300 select-none">
        <span className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-[9px] font-bold text-white">P</span>
        <span className="font-semibold text-red-400">{isEs ? 'ZeroPDF' : 'ZeroPDF'}</span>
        <span className="text-slate-500">/</span>
        <span className="text-slate-400 truncate">{manualName}</span>
        <div className="flex-1" />
        <span className="text-slate-500 flex items-center gap-2">
          <span className="inline-block w-3 h-3 text-center leading-none">−</span>
          <span className="inline-block w-3 h-3 text-center leading-none">+</span>
          <span className="font-mono text-[10px]">{isEs ? '100%' : '100%'}</span>
        </span>
      </div>
      <div className="flex-1 min-h-0 bg-slate-800/40 p-3 overflow-auto">
        <div className="bg-white rounded-sm shadow-xl w-full h-full min-h-[300px]">
          <iframe
            title="Manual de uso del simulador"
            src={manualPath}
            className="w-full h-full border-0 bg-white"
            data-testid="pdf-iframe"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 px-3 py-1.5 border-t border-slate-800 bg-slate-900 text-[10px] text-slate-500 select-none">
        <span>{isEs ? 'Página 1 de 1' : 'Page 1 of 1'}</span>
        <span className="flex-1" />
        <span>{isEs ? 'Guía breve de uso del simulador' : 'Quick guide to use the simulator'}</span>
      </div>
    </div>
  );
}
