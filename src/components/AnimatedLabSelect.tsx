// ── components/AnimatedLabSelect.tsx ──────────────────────────────────────
// Animated lab selection screen showing mouse cursor clicking START

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AnimatedLabSelectProps {
  className?: string;
}

const LABS = [
  { num: '0x01', name: 'WordPress Vulnerable Lab', diff: 'Easy', color: '#22d3ee', diffColor: '#10b981' },
  { num: '0x02', name: 'Web OSINT & SSH Compromise', diff: 'Medium', color: '#fbbf24', diffColor: '#f59e0b' },
  { num: '0x03', name: 'EternalBlue (MS17-010)', diff: 'Easy', color: '#f87171', diffColor: '#10b981' },
  { num: '0x04', name: 'Local File Inclusion / RCE', diff: 'Medium', color: '#a78bfa', diffColor: '#f59e0b' },
  { num: '0x05', name: 'FTP Enumeration & PrivEsc', diff: 'Medium', color: '#34d399', diffColor: '#f59e0b' },
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

    // Pick lab 01 (WordPress) as target
    const targetIndex = 0;

    // Use animationRef for self-referencing auto-restart
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

    // Phase 1: Show cursor appearing at top
    const t1 = setTimeout(() => {
      setCursorPos({ x: 40, y: 20 });
      setPhase('hovering');
    }, 500);
    timeoutsRef.current.push(t1);

    // Phase 2: Move cursor to the target lab
    const t2 = setTimeout(() => {
      setCursorPos({ x: 50, y: 52 });
    }, 1200);
    timeoutsRef.current.push(t2);

    // Phase 3: Click
    const t3 = setTimeout(() => {
      setPhase('clicking');
      setClickedLab(targetIndex);
    }, 2200);
    timeoutsRef.current.push(t3);

    // Phase 4: Selected
    const t4 = setTimeout(() => {
      setPhase('selected');
    }, 2800);
    timeoutsRef.current.push(t4);

    // Phase 5: Reset for loop
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
      <div className="rounded-xl overflow-hidden border shadow-2xl" style={{
        borderColor: '#22d3ee30',
        boxShadow: '0 0 30px #22d3ee15, 0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
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

        {/* Lab cards */}
        <div className="relative min-h-[220px] max-h-[220px] overflow-hidden p-3" style={{ background: '#0b1015' }}>
          {/* Background pattern */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #243030 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3,
          }} />

          {/* Lab cards grid */}
          <div className="relative z-10 grid grid-cols-3 gap-2">
            {LABS.map((lab, i) => {
              const isClicked = clickedLab === i;
              const isHovered = phase === 'hovering' && i === 0;
              return (
                <div
                  key={lab.num}
                  className="rounded-lg overflow-hidden border transition-all duration-300"
                  style={{
                    background: '#0d1117',
                    borderColor: isClicked ? lab.color : isHovered ? lab.color + '70' : '#1e2d2d',
                    boxShadow: isClicked ? `0 0 12px ${lab.color}40` : isHovered ? `0 0 8px ${lab.color}20` : '0 2px 8px #00000040',
                    transform: isClicked ? 'scale(0.95)' : 'scale(1)',
                    opacity: phase === 'selected' && !isClicked ? 0.5 : 1,
                  }}
                >
                  {/* Card top */}
                  <div className="h-12 flex items-center justify-center relative" style={{ background: '#090d12' }}>
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded absolute top-1 left-1"
                      style={{ background: '#00000090', color: lab.color, border: `1px solid ${lab.color}28` }}>
                      {lab.num}
                    </span>
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded absolute top-1 right-1"
                      style={{ background: '#00000090', color: lab.diffColor, border: `1px solid ${lab.diffColor}28` }}>
                      {lab.diff}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 px-1">{lab.name.split(' ')[0]}</span>
                  </div>
                  {/* Card bottom */}
                  <div className="px-1.5 py-1 flex items-center justify-between">
                    <span className="text-[7px] font-mono text-gray-600">{3 + i} missions</span>
                    <span
                      className="text-[7px] font-mono font-bold transition-all"
                      style={{
                        color: isClicked ? '#fff' : lab.color,
                        background: isClicked ? lab.color : 'none',
                        padding: '1px 4px',
                        borderRadius: '2px',
                      }}
                    >
                      {isClicked ? '→ LOADING' : 'START'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mouse cursor */}
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
