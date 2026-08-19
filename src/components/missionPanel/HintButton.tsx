// ── components/missionPanel/HintButton.tsx ───────────────────────
// Botones de revelado progresivo de hints por misión

import type { Mission } from '../../types';
import { useScenarioStore } from '../../store/scenarioStore';
import { useT, useLanguage } from '../../i18n/translations';

export function HintButton({ mission }: { mission: Mission }) {
  const revealNextHint = useScenarioStore(s => s.revealNextHint);
  const language = useLanguage();
  const t = useT();

  if (!mission.hints) return null;

  const getHintText = (hint: { en: string; es: string }) => {
    return language === 'es' ? hint.es : hint.en;
  };

  const hasHint1 = mission.hintLevel >= 1;
  const hasHint2 = mission.hintLevel >= 2;

  const handleHint1Click = () => {
    if (!hasHint1) revealNextHint(mission.id);
  };

  const handleHint2Click = () => {
    if (hasHint1 && !hasHint2) revealNextHint(mission.id);
  };

  return (
    <div className="space-y-2">
      {/* Hint 1 */}
      {hasHint1 ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-fadeIn">
          <span className="text-emerald-400">💡</span>
          <span className="text-xs text-emerald-300 font-mono">{getHintText(mission.hints.hint1)}</span>
        </div>
      ) : (
        <button
          onClick={handleHint1Click}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border border-blue-500/40 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 transition-all w-full"
        >
          <span>💡</span>
          <span>{t('showHint1')}</span>
        </button>
      )}

      {/* Hint 2 */}
      {hasHint2 ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-fadeIn">
          <span className="text-emerald-400">💡</span>
          <span className="text-xs text-emerald-300 font-mono">{getHintText(mission.hints.hint2)}</span>
        </div>
      ) : (
        <button
          onClick={handleHint2Click}
          disabled={!hasHint1}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-all w-full ${
            hasHint1
              ? 'border-blue-500/40 bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 cursor-pointer'
              : 'border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          <span>💡</span>
          <span>{t('showHint2')}</span>
        </button>
      )}
    </div>
  );
}
