// ── components/MachineLoader.tsx ─────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  machineName: string;
  machineIp: string;
  machineOs: string;
  onComplete: () => void;
  duration?: number;
  language?: 'en' | 'es';
}

interface LogEntry {
  text: string;
  timestamp: number;
  type: 'info' | 'ok' | 'warn' | 'retry';
}

interface LoadPhase {
  label: { en: string; es: string };
  duration: number;
  targetProgress: number;
  logLines?: { text: { en: string; es: string }; type: LogEntry['type']; atPercent: number }[];
}

const PHASES: LoadPhase[] = [
  {
    label: { en: 'Resolving infrastructure...', es: 'Resolviendo infraestructura...' },
    duration: 600,
    targetProgress: 15,
    logLines: [
      { text: { en: '→ Resolving lab DNS...', es: '→ Resolviendo DNS del laboratorio...' }, type: 'info', atPercent: 3 },
      { text: { en: '→ Infrastructure found ✓', es: '→ Infraestructura encontrada ✓' }, type: 'ok', atPercent: 10 },
    ],
  },
  {
    label: { en: 'Provisioning virtual machines...', es: 'Provisionando máquinas virtuales...' },
    duration: 900,
    targetProgress: 38,
    logLines: [
      { text: { en: '→ Provisioning {machineName}...', es: '→ Provisionando {machineName}...' }, type: 'info', atPercent: 18 },
      { text: { en: '→ Allocating resources...', es: '→ Asignando recursos...' }, type: 'info', atPercent: 28 },
      { text: { en: '→ Snapshot applied ✓', es: '→ Snapshot aplicado ✓' }, type: 'ok', atPercent: 35 },
    ],
  },
  {
    label: { en: 'Configuring isolated network...', es: 'Configurando red aislada...' },
    duration: 800,
    targetProgress: 55,
    logLines: [
      { text: { en: '→ Creating isolated virtual network...', es: '→ Creando red virtual aislada...' }, type: 'info', atPercent: 40 },
      { text: { en: '→ IP assigned: {machineIp}', es: '→ IP asignada: {machineIp}' }, type: 'ok', atPercent: 48 },
      { text: { en: '→ Firewall configured ✓', es: '→ Firewall configurado ✓' }, type: 'ok', atPercent: 53 },
    ],
  },
  {
    label: { en: 'Initializing services...', es: 'Inicializando servicios...' },
    duration: 700,
    targetProgress: 72,
    logLines: [
      { text: { en: '→ Detecting OS: {machineOs}', es: '→ Detectando OS: {machineOs}' }, type: 'info', atPercent: 58 },
      { text: { en: '→ Network services starting...', es: '→ Servicios de red arrancando...' }, type: 'info', atPercent: 65 },
      { text: { en: '→ Ports listening ✓', es: '→ Puertos escuchando ✓' }, type: 'ok', atPercent: 70 },
    ],
  },
  {
    label: { en: 'Deploying attack vectors...', es: 'Desplegando vectores de ataque...' },
    duration: 600,
    targetProgress: 88,
    logLines: [
      { text: { en: '→ Loading pentesting tools...', es: '→ Cargando herramientas de pentesting...' }, type: 'info', atPercent: 75 },
      { text: { en: '→ Attack vectors configured ✓', es: '→ Vectores de ataque configurados ✓' }, type: 'ok', atPercent: 85 },
    ],
  },
  {
    label: { en: 'Verifying connectivity...', es: 'Verificando conectividad...' },
    duration: 500,
    targetProgress: 96,
    logLines: [
      { text: { en: '→ Ping to gateway... OK', es: '→ Ping a gateway... OK' }, type: 'ok', atPercent: 92 },
      { text: { en: '→ Connection established ✓', es: '→ Conexión establecida ✓' }, type: 'ok', atPercent: 95 },
    ],
  },
  {
    label: { en: 'Finalizing...', es: 'Finalizando...' },
    duration: 400,
    targetProgress: 100,
    logLines: [
      { text: { en: '→ Lab ready. Access granted.', es: '→ Laboratorio listo. Acceso concedido.' }, type: 'ok', atPercent: 100 },
    ],
  },
];

const DEFAULT_TOTAL_DURATION = 6500;
const COUNTDOWN_DURATION = 1500;

const UI_TEXTS = {
  deploying: { en: 'DEPLOYING LAB', es: 'DESPLEGANDO LABORATORIO' },
  initializing: { en: 'INITIALIZING', es: 'INICIALIZANDO' },
  labActive: { en: 'LAB ACTIVE', es: 'LABORATORIO ACTIVO' },
  ready: { en: 'Ready', es: 'Listo' },
  accessGranted: { en: 'Access granted. Ready for attack.', es: 'Acceso concedido. Ready for attack.' },
  target: { en: 'target', es: 'objetivo' },
  ip: { en: 'ip', es: 'ip' },
};

function interpolateLogLine(text: string, machineName: string, machineIp: string, machineOs: string): string {
  return text
    .replace('{machineName}', machineName)
    .replace('{machineIp}', machineIp)
    .replace('{machineOs}', machineOs);
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
  }, [phase, machineName, machineIp, machineOs, language, onComplete, addLog]);

  const getPhaseColor = () => {
    if (phase === 'complete') return '#22c55e';
    if (progress < 30) return '#3b82f6';
    if (progress < 70) return '#10b981';
    return '#22c55e';
  };

  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-white p-8 select-none">
        {/* Title */}
        <div className="mb-12 text-center">
          <p className="text-xs font-mono tracking-[0.3em] text-gray-500 uppercase mb-3">
            ZeroInfra Labs
          </p>
          <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight" style={{ color: '#10b981' }}>
            {UI_TEXTS.deploying[language]}
          </h1>
        </div>

        {/* Countdown number */}
        <div className="relative mb-12">
          <span
            key={countdown}
            className="text-8xl md:text-9xl font-black font-mono block text-center"
            style={{
              color: countdown > 0 ? '#10b981' : '#22c55e',
              textShadow: `0 0 40px ${countdown > 0 ? '#10b98166' : '#22c55e66'}`,
              animation: 'countdownPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {countdown > 0 ? countdown : 'GO'}
          </span>
        </div>

        {/* Machine info */}
        <div className="text-center font-mono text-sm text-gray-500 space-y-1">
          <p>
            <span className="text-gray-600">{UI_TEXTS.target[language]}:</span>{' '}
            <span className="text-gray-400">{machineName}</span>
            {' '}<span className="text-gray-700">|</span>{' '}
            <span className="text-gray-600">ip:</span>{' '}
            <span className="text-gray-400">{machineIp}</span>
          </p>
        </div>

        {/* Decorative line */}
        <div className="mt-8 flex items-center gap-2">
          <div className="h-px w-16 bg-gray-800" />
          <span className="text-[10px] font-mono text-gray-700 tracking-widest">{UI_TEXTS.initializing[language]}</span>
          <div className="h-px w-16 bg-gray-800" />
        </div>

        <style>{`
          @keyframes countdownPop {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-white p-8 select-none">
        {/* Checkmark circle */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              border: `3px solid #22c55e`,
              boxShadow: '0 0 30px #22c55e33',
              animation: 'completePulse 0.6s ease-out',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold font-mono mb-2" style={{ color: '#22c55e' }}>
          {UI_TEXTS.labActive[language]}
        </h2>
        <p className="text-sm font-mono text-gray-400 mb-6">
          {machineName} — {machineIp}
        </p>

        {/* Quick log summary */}
        <div className="w-72 max-h-32 overflow-hidden font-mono text-[10px] text-gray-600 space-y-0.5 opacity-60">
          {logs.slice(-4).map((log, i) => (
            <div key={i}>
              <span style={{ color: log.type === 'ok' ? '#22c55e' : '#6b7280' }}>
                {log.type === 'ok' ? '✓' : '→'}
              </span>{' '}
              {log.text}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs font-mono text-emerald-400 animate-pulse">
          {UI_TEXTS.accessGranted[language]}
        </p>

        <style>{`
          @keyframes completePulse {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Loading phase
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-white p-8 select-none">
      {/* Machine info */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-mono mb-1" style={{ color: getPhaseColor() }}>
          {machineName}
        </h2>
        <p className="text-sm font-mono text-gray-400">
          {machineIp} <span className="text-gray-600">|</span> {machineOs}
        </p>
      </div>

      {/* Terminal-style log output */}
      <div className="w-80 max-h-32 overflow-hidden mb-6 font-mono text-sm space-y-0.5">
        {logs.map((log, i) => (
          <div
            key={log.timestamp + i}
            style={{
              animation: 'logFadeIn 0.2s ease-out',
              color: log.type === 'ok' ? '#22c55e' : log.type === 'warn' ? '#f59e0b' : log.type === 'retry' ? '#f97316' : '#9ca3af',
            }}
          >
            <span className="text-gray-700">[{String(i + 1).padStart(2, '0')}]</span>{' '}
            {log.text}
          </div>
        ))}
      </div>

      {/* Progress section */}
      <div className="w-72 mb-3">
        <div className="flex justify-between text-sm font-mono mb-2">
          <span style={{ color: '#9ca3af' }}>
            {currentLabel}
          </span>
          <span style={{ color: getPhaseColor() }}>{progress}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${getPhaseColor()}, #22c55e)`,
              boxShadow: `0 0 12px ${getPhaseColor()}44`,
            }}
          />
        </div>
      </div>

      {/* Decorative bottom */}
      <div className="flex items-center gap-1 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full"
            style={{
              height: `${8 + Math.random() * 8}px`,
              background: i < Math.floor(progress / 12.5) ? getPhaseColor() : '#1f2937',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes logFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
