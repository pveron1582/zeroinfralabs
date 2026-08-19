// ── components/MachineLoader.tsx ─────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { PHASES, DEFAULT_TOTAL_DURATION, COUNTDOWN_DURATION, UI_TEXTS, interpolateLogLine, type LogEntry } from './machineLoader/phases';
import { CountdownScreen, CompleteScreen, LoadingScreen } from './machineLoader/screens';

interface Props {
  machineName: string;
  machineIp: string;
  machineOs: string;
  onComplete: () => void;
  duration?: number;
  language?: 'en' | 'es';
}

export function MachineLoader({ machineName, machineIp, machineOs, onComplete, duration = DEFAULT_TOTAL_DURATION, language = 'en' }: Props) {
  const LOADING_DURATION = duration - COUNTDOWN_DURATION;
  const [phase, setPhase] = useState<'countdown' | 'loading' | 'complete'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentLabel, setCurrentLabel] = useState('');
  const logsRef = useRef<LogEntry[]>([]);
  const loggedKeysRef = useRef<Set<string>>(new Set());

  const addLog = useCallback((text: string, type: LogEntry['type']) => {
    const key = text + type;
    if (loggedKeysRef.current.has(key)) return;
    loggedKeysRef.current.add(key);
    const entry: LogEntry = { text, timestamp: Date.now(), type };
    logsRef.current = [...logsRef.current, entry];
    setLogs([...logsRef.current]);
  }, []);

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.ceil((COUNTDOWN_DURATION - elapsed) / (COUNTDOWN_DURATION / 3));

      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(0);
        setPhase('loading');
        return;
      }
      setCountdown(remaining);
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // Loading phase — non-linear progress with stalls
  useEffect(() => {
    if (phase !== 'loading') return;

    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const effectiveProgress = Math.min(100, (elapsed / LOADING_DURATION) * 100);

      // Determine current phase label
      let currentPhaseLabel = '';
      for (const p of PHASES) {
        if (effectiveProgress < p.targetProgress) {
          currentPhaseLabel = p.label[language];
          break;
        }
      }
      if (!currentPhaseLabel) currentPhaseLabel = PHASES[PHASES.length - 1].label[language];
      setCurrentLabel(currentPhaseLabel);

      // Check for log lines to emit
      for (const p of PHASES) {
        for (const log of (p.logLines || [])) {
          if (effectiveProgress >= log.atPercent) {
            const resolvedText = interpolateLogLine(log.text[language], machineName, machineIp, machineOs);
            addLog(resolvedText, log.type);
          }
        }
      }

      setProgress(Math.floor(Math.min(100, effectiveProgress)));

      if (elapsed >= LOADING_DURATION) {
        setProgress(100);
        setCurrentLabel(UI_TEXTS.ready[language]);
        setPhase('complete');
        setTimeout(onComplete, 400);
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [phase, machineName, machineIp, machineOs, language, onComplete, addLog, LOADING_DURATION]);

  const getPhaseColor = () => {
    if (phase === 'complete') return '#22c55e';
    if (progress < 30) return '#3b82f6';
    if (progress < 70) return '#10b981';
    return '#22c55e';
  };

  let content: React.ReactNode;
  if (phase === 'countdown') {
    content = <CountdownScreen machineName={machineName} machineIp={machineIp} language={language} countdown={countdown} />;
  } else if (phase === 'complete') {
    content = <CompleteScreen machineName={machineName} machineIp={machineIp} language={language} logs={logs} />;
  } else {
    content = (
      <LoadingScreen
        machineName={machineName} machineIp={machineIp} machineOs={machineOs}
        logs={logs} currentLabel={currentLabel} progress={progress} phaseColor={getPhaseColor()}
      />
    );
  }

  // Ventana con transparencia (estilo terminal) que contiene la animación
  return (
    <div className="w-full h-full flex items-center justify-center select-none">
      <div className="flex flex-col w-[min(440px,92vw)] h-[min(520px,82vh)] bg-slate-950/95 border border-slate-700/70 rounded-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Title bar */}
        <div className="h-8 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="text-emerald-500 font-mono font-bold">&gt;_</span>
            <span>{UI_TEXTS.windowTitle[language]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
        </div>

        {/* Cuerpo con transparencia como las terminales */}
        <div className="flex-1 min-h-0 relative overflow-hidden" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
          {content}
        </div>
      </div>
    </div>
  );
}
