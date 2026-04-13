// ── components/AnimatedCompletion.tsx ──────────────────────────────────────
// Animated lab completion screen with trophy + confetti

import React from 'react';

interface AnimatedCompletionProps {
  labName?: string;
  missionsCompleted?: number;
  totalMissions?: number;
  className?: string;
}

export function AnimatedCompletion({
  labName = 'WordPress Vulnerable Lab',
  missionsCompleted = 8,
  totalMissions = 8,
  className = '',
}: AnimatedCompletionProps) {
  // Confetti dots
  const confetti = Array.from({ length: 40 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 5,
    color: ['#10b981', '#22d3ee', '#f59e0b', '#f87171', '#a78bfa', '#34d399'][Math.floor(Math.random() * 6)],
    delay: Math.random() * 1.5,
  }));

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-xl overflow-hidden border shadow-2xl" style={{
        borderColor: '#10b98130',
        boxShadow: '0 0 40px #10b98120, 0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Confetti overlay */}
        <div className="relative min-h-[220px] max-h-[220px] overflow-hidden" style={{ background: '#0a0e14' }}>
          {/* Confetti dots */}
          {confetti.map((c, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: c.size,
                height: c.size,
                background: c.color,
                opacity: 0.7,
                animation: `confettiFall 2s ease-in ${c.delay}s infinite`,
              }}
            />
          ))}

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {/* Trophy */}
            <div className="text-5xl mb-3" style={{ animation: 'trophyPop 0.5s ease-out', filter: 'drop-shadow(0 0 12px #f59e0b60)' }}>
              🏆
            </div>

            {/* Title */}
            <div className="text-lg font-bold mb-1" style={{
              background: 'linear-gradient(100deg, #10b981, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'fadeInUp 0.5s ease-out 0.3s both',
            }}>
              LAB COMPLETED
            </div>

            {/* Lab name */}
            <div className="text-xs text-gray-400 mb-3 font-mono" style={{ animation: 'fadeInUp 0.5s ease-out 0.5s both' }}>
              {labName}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
              background: '#10b98115',
              border: '1px solid #10b98130',
              animation: 'fadeInUp 0.5s ease-out 0.7s both',
            }}>
              <span className="text-emerald-400 text-sm font-bold">✓</span>
              <span className="text-emerald-300 text-xs font-mono">{missionsCompleted}/{totalMissions} missions</span>
            </div>

            {/* Flag preview */}
            <div className="mt-3 px-3 py-1.5 rounded font-mono text-[10px]" style={{
              background: '#1e1e2e',
              border: '1px solid #333355',
              color: '#a78bfa',
              animation: 'fadeInUp 0.5s ease-out 0.9s both',
            }}>
              ZIL&#123;***************&#125;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
