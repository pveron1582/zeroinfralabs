// ── components/AnimatedLabSelect.tsx ──────────────────────────────────────
// Animated lab selection screen showing mouse cursor clicking START
// Styled to match the real LabGrid component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FONT_MONO } from './landing/constants';

interface AnimatedLabSelectProps {
  className?: string;
}

const LABS = [
  { num: '0x01', name: 'WordPress Vulnerable Lab', category: 'Web', diff: 'Easy', missions: 8, color: '#22d3ee', diffColor: '#10b981' },
  { num: '0x02', name: 'Web OSINT & SSH Compromise', category: 'Web', diff: 'Medium', missions: 7, color: '#fbbf24', diffColor: '#f59e0b' },
  { num: '0x03', name: 'EternalBlue (MS17-010)', category: 'Exploit', diff: 'Easy', missions: 6, color: '#f87171', diffColor: '#10b981' },
  { num: '0x04', name: 'Local File Inclusion / RCE', category: 'Web', diff: 'Medium', missions: 5, color: '#a78bfa', diffColor: '#f59e0b' },
  { num: '0x05', name: 'FTP Enumeration & PrivEsc', category: 'Enum', diff: 'Medium', missions: 6, color: '#34d399', diffColor: '#f59e0b' },
];

export function AnimatedLabSelect({ className = '' }: AnimatedLabSelectProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [clickedLab, setClickedLab] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'hovering' | 'clicking' | 'selected' | 'reset'>('idle');
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animationRef = useRef<(() => void) | null>(null);

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setCursorPos(null);
    setClickedLab(null);
    setPhase('idle');
  }, [cleanup]);

  const runAnimation = useCallback(() => {
    cleanup();

    const targetIndex = 0;

    const restartCycle = () => {
      setPhase('reset');
      const t6 = setTimeout(() => {
        reset();
        const t7 = setTimeout(() => {
          animationRef.current?.();
        }, 500);
        timeoutsRef.current.push(t7);
      }, 400);
      timeoutsRef.current.push(t6);
    };

    const t1 = setTimeout(() => {
      setCursorPos({ x: 18, y: 8 });
      setPhase('hovering');
    }, 500);
    timeoutsRef.current.push(t1);

    const t2 = setTimeout(() => {
      setCursorPos({ x: 18, y: 30 });
    }, 1200);
    timeoutsRef.current.push(t2);

    const t3 = setTimeout(() => {
      setPhase('clicking');
      setClickedLab(targetIndex);
    }, 2200);
    timeoutsRef.current.push(t3);

    const t4 = setTimeout(() => {
      setPhase('selected');
    }, 2800);
    timeoutsRef.current.push(t4);

    const t5 = setTimeout(restartCycle, 5000);
    timeoutsRef.current.push(t5);
  }, [cleanup, reset]);

  useEffect(() => {
    animationRef.current = runAnimation;
    const t = setTimeout(runAnimation, 600);
    return () => { clearTimeout(t); cleanup(); };
  }, [runAnimation, cleanup]);

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-xl overflow-hidden border shadow-lg" style={{
        borderColor: '#e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#0d1117' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-500 font-mono">ZI Labs — Choose a Lab</span>
          </div>
          <div className="w-16" />
        </div>

        <div className="relative min-h-[300px] max-h-[300px] overflow-hidden p-3" style={{ background: '#f8fafc' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.4,
          }} />

          <div className="relative z-10 grid grid-cols-3 gap-2">
            {LABS.map((lab, i) => {
              const isClicked = clickedLab === i;
              const isHovered = phase === 'hovering' && i === 0;
              return (
                <div
                  key={lab.num}
                  className="rounded-lg overflow-hidden border transition-all duration-300 flex flex-col"
                  style={{
                    background: '#ffffff',
                    borderColor: isClicked ? lab.color : isHovered ? lab.color + '70' : '#e2e8f0',
                    boxShadow: isClicked ? `0 0 12px ${lab.color}40` : isHovered ? `0 4px 12px ${lab.color}18` : '0 1px 3px rgba(0,0,0,0.06)',
                    transform: isClicked ? 'scale(0.95)' : isHovered ? 'translateY(-2px)' : 'scale(1)',
                    opacity: phase === 'selected' && !isClicked ? 0.5 : 1,
                  }}
                >
                  {/* Image area with gradient overlay */}
                  <div className="relative h-14 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                    <div className="absolute inset-0" style={{
                      background: `linear-gradient(135deg, ${lab.color}15, transparent 60%)`,
                    }} />
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded absolute top-1 left-1"
                      style={{ background: '#ffffffcc', color: lab.color, border: `1px solid ${lab.color}48`, zIndex: 2 }}>
                      {lab.num}
                    </span>
                    <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded absolute top-1 right-1"
                      style={{ background: '#ffffffcc', color: lab.diffColor, border: `1px solid ${lab.diffColor}48`, zIndex: 2 }}>
                      {lab.diff}
                    </span>
                  </div>

                  {/* Content area */}
                  <div className="p-1.5 flex flex-col flex-1 gap-1">
                    <span className="text-[6px] font-mono font-medium px-1 py-0.5 rounded self-start"
                      style={{ background: `${lab.color}14`, color: lab.color, border: `1px solid ${lab.color}25` }}>
                      {lab.category}
                    </span>
                    <span className="text-[7px] font-semibold leading-tight text-slate-700 line-clamp-1" style={{ fontFamily: FONT_MONO }}>
                      {lab.name}
                    </span>
                    <div className="flex items-center justify-between mt-auto pt-1" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <span className="text-[6px] font-mono text-slate-400">{lab.missions} missions</span>
                      <span
                        className="text-[6px] font-mono font-bold transition-all"
                        style={{
                          color: isClicked ? '#fff' : lab.color,
                          background: isClicked ? lab.color : 'none',
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}
                      >
                        {isClicked ? '→ LOADING' : 'START'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {cursorPos && phase !== 'reset' && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                transform: phase === 'clicking' ? 'scale(0.8)' : 'scale(1)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1.5">
                <path d="M5 3l14 8-6 2-3 6z"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
