// ── components/LabCompletionOverlay.tsx ────────────────────────────
import React, { useState, useEffect, useMemo } from 'react';
import type { Scenario } from '../types';

interface Props {
  scenario: Scenario;
  totalMissions: number;
  completedCount: number;
  onClose: () => void;
  language?: 'en' | 'es';
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = ['#10b981', '#22d3ee', '#f59e0b', '#a855f7', '#ef4444', '#ec4899', '#3b82f6'];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

const UI_TEXTS = {
  title: { en: 'LAB COMPLETE!', es: '¡LABORATORIO COMPLETADO!' },
  missionsCompleted: { en: 'missions completed', es: 'misiones completadas' },
  continue: { en: 'Continue', es: 'Continuar' },
};

export function LabCompletionOverlay({ scenario, totalMissions, completedCount, onClose, language = 'en' }: Props) {
  const [visible, setVisible] = useState(false);
  const particles = useMemo(() => generateParticles(40), []);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/90 backdrop-blur-md"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
      }}
      onClick={() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }}
    >
      {/* Confetti particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            borderRadius: p.size > 8 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s infinite`,
            opacity: 0.8,
          }}
        />
      ))}

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-8"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.7)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Trophy */}
        <div
          className="mb-6"
          style={{
            animation: visible ? 'trophyPulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-black font-mono tracking-tight mb-3"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #22d3ee 50%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px #10b98144)',
          }}
        >
          {UI_TEXTS.title[language]}
        </h1>

        {/* Scenario name */}
        <p className="text-lg text-gray-300 font-mono mb-2">
          {scenario.name}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-8">
          <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-2xl font-bold font-mono text-emerald-400">{completedCount}</span>
            <span className="text-xs text-gray-500 font-mono ml-1">/ {totalMissions}</span>
          </div>
          <span className="text-sm text-gray-500 font-mono">{UI_TEXTS.missionsCompleted[language]}</span>
        </div>

        {/* Continue button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 400);
          }}
          className="px-8 py-3 rounded-lg font-mono text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            boxShadow: '0 0 20px #10b98144, 0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {UI_TEXTS.continue[language]}
        </button>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes trophyPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 8px #f59e0b44);
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 16px #f59e0b66);
          }
        }
      `}</style>
    </div>
  );
}
