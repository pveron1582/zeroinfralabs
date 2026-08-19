// ── components/appContent/WorkspaceOverlays.tsx ─────────────────
// Notificación toast y overlays de fin de laboratorio (completion + survey)

import type { Scenario } from '../../types';
import type { Notification } from '../../store/types';
import { SurveyModal } from '../SurveyModal';
import { LabCompletionOverlay } from '../LabCompletionOverlay';

interface Props {
  notification: Notification | null;
  showCompletionOverlay: boolean;
  showSurvey: boolean;
  pendingSurveyScenario: Scenario | null;
  currentScenario: Scenario;
  totalMissions: number;
  completedCount: number;
  language: 'en' | 'es';
  onCloseCompletion: () => void;
  onSurveySubmit: () => void;
}

export function WorkspaceOverlays({
  notification,
  showCompletionOverlay,
  showSurvey,
  pendingSurveyScenario,
  currentScenario,
  totalMissions,
  completedCount,
  language,
  onCloseCompletion,
  onSurveySubmit,
}: Props) {
  return (
    <>
      {notification && (
        <div key={notification.id}
          className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-emerald-900 border border-emerald-500/50 rounded-xl shadow-2xl text-emerald-300 text-sm font-medium z-50"
          style={{ animation: 'slideUpNotif 0.3s ease-out' }}>
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          {notification.text}
        </div>
      )}

      {showCompletionOverlay && (
        <LabCompletionOverlay
          scenario={currentScenario}
          totalMissions={totalMissions}
          completedCount={completedCount}
          onClose={onCloseCompletion}
          language={language}
        />
      )}

      {showSurvey && pendingSurveyScenario && (
        <SurveyModal
          scenario={pendingSurveyScenario}
          onSubmit={onSurveySubmit}
        />
      )}

      <style>{`
        @keyframes slideUpNotif { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px }
      `}</style>
    </>
  );
}
