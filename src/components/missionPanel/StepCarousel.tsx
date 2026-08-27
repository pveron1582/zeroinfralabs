// ── components/missionPanel/StepCarousel.tsx ─────────────────────
// Carrusel de pasos de misión con animación y auto-avance al completar

import { useState, useEffect, useCallback, useRef } from "react"
import type { Mission } from '../../types';
import { HintButton } from './HintButton';

export function StepCard({ fullText, titleText, done, active }: { fullText: string, titleText: string, done: boolean, active: boolean }) {
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

export function StepCarousel({ missions, resolve, language }: { missions: Mission[], resolve: (text: string, targetId?: string) => string, language: 'en' | 'es' }) {
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
  }, [visibleMissions, currentIndex, isAnimating, goTo]);

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
            fullText={resolve(missionDesc, currentMission.targetMachineId)}
            titleText={missionTitle}
            done={currentMission.status === 'completed'}
            active={currentMission.status === 'active'}
          />
        </div>
      </div>

      {/* Hints debajo del card */}
      <div className="px-4 pt-2 pb-1">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent mb-3" />
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
