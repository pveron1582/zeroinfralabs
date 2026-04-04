// ── components/MissionPanel.tsx ───────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from "react"
import type { Mission, Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { useT, useLanguage } from '../i18n/translations';

interface Props {
  missions: Mission[];
  allMachines: Machine[];
  networkRange: string;
  onOpenBrowser: () => void;
  onOpenNetworkMap: () => void;
}

function HintButton({ mission }: { mission: Mission }) {
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

function StepCard({ mission, fullText, titleText, done, active }: { mission: Mission, fullText: string, titleText: string, done: boolean, active: boolean }) {
  return (
    <div 
      className={`rounded-lg border p-5 transition-colors h-full ${
        done ? 'border-emerald-500/40 bg-emerald-500/5' : 
        active ? 'border-blue-500/50 bg-blue-500/5' : 
        'border-gray-700/50 bg-gray-800/20'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 flex-shrink-0">
          {done ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ) : active ? (
            <div className="w-6 h-6 rounded-full border-2 border-blue-400 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center opacity-50">
              <span className="text-xs text-gray-500">○</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-base font-semibold mb-2 ${done ? 'text-emerald-400' : active ? 'text-blue-300' : 'text-gray-400'}`}>
            {titleText}
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed font-mono">
            {fullText}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepCarousel({ missions, resolve, language }: { missions: Mission[], resolve: (text: string, targetId?: string) => string, language: 'en' | 'es' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
  const userNavigatedRef = useRef(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCompletedKeyRef = useRef<string>('');
  const needsAutoAdvanceRef = useRef(false);
  
  const visibleMissions = missions.filter(m => m.status !== 'pending');
  const completedKey = visibleMissions.filter(m => m.status === 'completed').map(m => m.id).join(',');
  
  const goTo = useCallback((newIndex: number, direction: 'left' | 'right') => {
    if (isAnimating || newIndex === currentIndex) return;
    if (newIndex < 0 || newIndex >= visibleMissions.length) return;
    
    userNavigatedRef.current = true;
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    needsAutoAdvanceRef.current = false;
    setIsAnimating(true);
    setAnimationDirection(direction);
    setCurrentIndex(newIndex);
    
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => { userNavigatedRef.current = false; }, 100);
    }, 300);
  }, [currentIndex, isAnimating, visibleMissions.length]);
  
  const goNext = useCallback(() => {
    if (currentIndex < visibleMissions.length - 1) {
      goTo(currentIndex + 1, 'right');
    }
  }, [currentIndex, visibleMissions.length, goTo]);
  
  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1, 'left');
    }
  }, [currentIndex, goTo]);
  
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < visibleMissions.length - 1;
  const currentMission = visibleMissions[currentIndex];
  
  // Detect when a mission completes
  useEffect(() => {
    if (userNavigatedRef.current || isAnimating) return;
    if (!completedKey) return;
    
    const keyChanged = lastCompletedKeyRef.current !== completedKey;
    lastCompletedKeyRef.current = completedKey;
    
    if (keyChanged) {
      const activeIndex = visibleMissions.findIndex(m => m.status === 'active');
      if (activeIndex !== -1 && activeIndex !== currentIndex) {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          goTo(activeIndex, 'right');
        }, 500);
      }
    }
  }, [completedKey, currentIndex, isAnimating, visibleMissions, goTo]);
  
  // If a pending auto-advance exists and we're now on the right screen, fire it
  useEffect(() => {
    if (needsAutoAdvanceRef.current && !userNavigatedRef.current && !isAnimating) {
      const activeIndex = visibleMissions.findIndex(m => m.status === 'active');
      if (activeIndex !== -1 && activeIndex !== currentIndex) {
        needsAutoAdvanceRef.current = false;
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          goTo(activeIndex, 'right');
        }, 500);
      }
    }
  }, [visibleMissions.length, currentIndex, isAnimating, goTo]);
  
  if (!currentMission) return null;
  
  const missionTitle = language === 'es' && currentMission.titleEs ? currentMission.titleEs : currentMission.title;
  const missionDesc = language === 'es' && currentMission.descriptionEs ? currentMission.descriptionEs : currentMission.description;
  
  const cardAnimation = isAnimating 
    ? animationDirection === 'right' 
      ? 'slideOutLeft' 
      : 'slideOutRight'
    : animationDirection === 'right'
      ? 'slideInFromRight'
      : 'slideInFromLeft';
  
  return (
    <div className="flex flex-col h-full">
      {/* Header con flechas */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <button
          onClick={goPrev}
          disabled={!canGoPrev || isAnimating}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            canGoPrev && !isAnimating
              ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 cursor-pointer' 
              : 'text-gray-700 cursor-not-allowed'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        
        <div className="text-center">
          <span className="text-xs font-mono text-gray-500">
            {language === 'es' ? 'Paso' : 'Step'} {currentIndex + 1} {language === 'es' ? 'de' : 'of'} {missions.length}
          </span>
        </div>
        
        <button
          onClick={goNext}
          disabled={!canGoNext || isAnimating}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            canGoNext && !isAnimating
              ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 cursor-pointer' 
              : 'text-gray-700 cursor-not-allowed'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
      
      {/* Cuadro del step */}
      <div className="px-4 py-3">
        <div
          key={currentIndex}
          className={`animate-${cardAnimation}`}
        >
          <StepCard
            mission={currentMission}
            fullText={resolve(missionDesc, currentMission.targetMachineId)}
            titleText={missionTitle}
            done={currentMission.status === 'completed'}
            active={currentMission.status === 'active'}
          />
        </div>
      </div>
      
      {/* Hints debajo del card */}
      <div className="px-4 pb-2">
        <HintButton mission={currentMission} />
      </div>
      
      {/* Puntos de navegación */}
      <div className="px-4 py-2 border-t border-gray-800/50">
        <div className="flex justify-center gap-2">
          {visibleMissions.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => goTo(idx, idx > currentIndex ? 'right' : 'left')}
              disabled={isAnimating}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-blue-400 w-5'
                  : idx < currentIndex
                    ? 'bg-emerald-500/50 hover:bg-emerald-400'
                    : 'bg-gray-700 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MissionPanel({ missions, allMachines, networkRange, onOpenBrowser, onOpenNetworkMap }: Props) {
  const hasNewNetworkInfo = useScenarioStore(s => s.hasNewNetworkInfo);
  const t = useT();
  const language = useLanguage();

  const completed = missions.filter(m => m.status === 'completed').length;
  const total     = missions.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const resolve = (text: string, targetId?: string) => {
    let resolved = text.replace(/<network\/cidr>/g, networkRange);
    if (targetId) {
      const m = allMachines.find(m => m.id === targetId);
      resolved = resolved.replace(/<IP>/g, (m?.discovery_level || 0) > 0 ? m!.machine_info.ip : '???');
      resolved = resolved.replace(/<target-ip>/g, (m?.discovery_level || 0) > 0 ? m!.machine_info.ip : '???');
    }
    return resolved;
  };

  const visibleMissions = missions.filter(m => m.status !== 'pending');

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-gray-900 border-l border-gray-800">
      {/* Header - solo botón de red, más grande */}
      <div className="px-4 py-3 border-b border-gray-800 flex justify-center">
        <button onClick={onOpenNetworkMap} className={`flex items-center justify-center gap-3 px-6 py-3 rounded-lg text-sm font-medium border transition-all w-full max-w-xs ${hasNewNetworkInfo ? 'animate-pulse border-violet-400 text-violet-400 bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-600'}`} title="Network Map">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/><rect x="16" y="16" width="6" height="6"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="5" y1="14" x2="12" y2="14"/><line x1="19" y1="14" x2="12" y2="14"/></svg>
          <span>{t('viewNetwork')}</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-gray-800">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-600 uppercase tracking-wider">{t('progress')}</span>
          <span className={`text-xs font-bold font-mono ${pct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {pct === 100 ? t('compromised') : `${pct}%`}
          </span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#f59e0b' }} />
        </div>
        <div className="mt-1 text-xs text-gray-700">{completed}/{total} completed</div>
      </div>

      {/* Mission carousel - siempre visible */}
      <StepCarousel missions={missions} resolve={resolve} language={language} />

      {/* Styles for animations */}
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInFromRight {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
        .animate-slideInFromLeft {
          animation: slideInFromLeft 0.3s ease-out forwards;
        }
        .animate-slideOutLeft {
          animation: slideOutLeft 0.3s ease-out forwards;
        }
        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
