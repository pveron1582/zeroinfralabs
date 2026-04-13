// ── components/AnimatedTerminal.tsx ──────────────────────────────────────
// Animated terminal mockup for landing page — CSS-only with typewriter effect
// Simulates a Kali Linux terminal with realistic command + output animation

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TerminalPhase {
  type: 'typing' | 'output';
  text: string;
  lines?: string[];
  delay?: number[];
}

interface AnimatedTerminalProps {
  title?: string;
  prompt: string;
  command: string;
  outputLines: string[];
  outputDelays?: number[];
  accentColor?: string;
  className?: string;
}

export function AnimatedTerminal({
  title,
  prompt,
  command,
  outputLines,
  outputDelays,
  accentColor = '#10b981',
  className = '',
}: AnimatedTerminalProps) {
  const [visible, setVisible] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'typing' | 'output' | 'done'>('idle');
  const [typedText, setTypedText] = useState('');
  const [outputIdx, setOutputIdx] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Compute fixed height based on number of output lines
  const estimatedHeight = Math.max(180, (outputLines.length + 2) * 18 + 40);

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setTypedText('');
    setOutputIdx(0);
    setVisibleLines([]);
    setCurrentPhase('idle');
  }, [cleanup]);

  const runAnimation = useCallback(() => {
    cleanup();
    setCurrentPhase('typing');
    setTypedText('');
    setOutputIdx(0);
    setVisibleLines([]);

    // Phase 1: Type the command character by character
    let charIdx = 0;
    const typeChar = () => {
      if (charIdx <= command.length) {
        setTypedText(command.slice(0, charIdx));
        charIdx++;
        const t = setTimeout(typeChar, 55 + Math.random() * 40);
        timeoutsRef.current.push(t);
      } else {
        // Phase 2: Show output line by line
        setCurrentPhase('output');
        const delays = outputDelays || outputLines.map(() => 180);
        let lineIdx = 0;
        const showLine = () => {
          if (lineIdx < outputLines.length) {
            setVisibleLines(prev => [...prev, outputLines[lineIdx]]);
            lineIdx++;
            setOutputIdx(lineIdx);
            if (lineIdx < outputLines.length) {
              const t = setTimeout(showLine, delays[lineIdx] || 180);
              timeoutsRef.current.push(t);
            } else {
              setCurrentPhase('done');
              // Auto-restart after a pause
              const t = setTimeout(() => {
                reset();
                const t2 = setTimeout(runAnimation, 800);
                timeoutsRef.current.push(t2);
              }, 3500);
              timeoutsRef.current.push(t);
            }
          }
        };
        const t = setTimeout(showLine, 500);
        timeoutsRef.current.push(t);
      }
    };
    const t = setTimeout(typeChar, 600);
    timeoutsRef.current.push(t);
  }, [command, outputLines, outputDelays, cleanup, reset]);

  // Simple mount-based animation (no IntersectionObserver for compatibility)
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      runAnimation();
    }, 300);
    return () => {
      clearTimeout(t);
      cleanup();
    };
  }, [runAnimation, cleanup]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  // Color-code output lines (heuristic)
  const getLineClass = (line: string): string => {
    if (!line) return 'text-gray-300';
    if (line.startsWith('PORT') || line.startsWith('────') || line.startsWith('─')) return 'text-gray-300 font-bold';
    if (line.includes('/tcp') && line.includes('open')) return 'text-emerald-400';
    if (line.includes('filtered') || line.includes('closed')) return 'text-gray-500';
    if (line.startsWith('Nmap scan') || line.startsWith('Starting') || line.startsWith('Service detection')) return 'text-gray-400';
    if (line.startsWith('Found:')) return 'text-amber-300';
    if (line.startsWith('Status:')) return 'text-gray-500';
    if (line.startsWith('➜') || line.startsWith('✓')) return 'text-emerald-400 font-semibold';
    if (line.startsWith('STATUS:')) return 'text-gray-500';
    return 'text-gray-300';
  };

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`}>
      {title && (
        <p className="text-xs font-mono text-gray-500 mb-2 text-center">{title}</p>
      )}
      <div
        className="rounded-xl overflow-hidden border shadow-2xl"
        style={{
          borderColor: accentColor + '30',
          boxShadow: `0 0 30px ${accentColor}15, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#0d1117' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-500 font-mono">root@kali</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Terminal body */}
        <div
          className="p-4 font-mono text-xs leading-relaxed relative overflow-hidden"
          style={{
            background: '#0a0e14',
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
            height: `${estimatedHeight}px`,
            overflow: 'hidden',
          }}
        >
          {/* Scanlines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px)' }}
          />

          {/* Prompt + command */}
          <div className="relative z-10">
            <span className="text-emerald-400">┌──(</span>
            <span className="text-cyan-400">root㉿kali</span>
            <span className="text-emerald-400">)-[</span>
            <span className="text-blue-400">~</span>
            <span className="text-emerald-400">]</span>
          </div>
          <div className="relative z-10 flex items-center">
            <span className="text-emerald-400">└─$ </span>
            <span className="text-gray-100">{typedText}</span>
            {(currentPhase === 'typing') && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 animate-pulse" style={{ background: accentColor }} />
            )}
          </div>

          {/* Output lines */}
          <div className="relative z-10 mt-1 space-y-0">
            {visibleLines.map((line, i) => (
              <div key={i} className={getLineClass(line ?? '')}>
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
