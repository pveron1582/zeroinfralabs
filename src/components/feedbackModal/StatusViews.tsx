// ── components/feedbackModal/StatusViews.tsx ────────────────────
// Vistas de estado del modal: envío exitoso y cooldown posterior

function formatTime(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SubmittedView({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="text-lg text-emerald-400">{text}</p>
    </div>
  );
}

export function CooldownView({ language, remaining }: { language: 'en' | 'es'; remaining: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p className="text-lg text-amber-400 mb-2">
        {language === 'es' ? 'Enviaste un comentario recientemente' : 'You recently submitted feedback'}
      </p>
      <p className="text-sm text-gray-400">
        {language === 'es'
          ? `Podés enviar otro en ${formatTime(remaining)}`
          : `You can send another in ${formatTime(remaining)}`
        }
      </p>
    </div>
  );
}
