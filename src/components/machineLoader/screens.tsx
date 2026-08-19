// ── components/machineLoader/screens.tsx ─────────────────────────
// Pantallas presentacionales del loader: countdown, carga y completado

import type { LogEntry } from './phases';
import { UI_TEXTS } from './phases';

export function CountdownScreen({ machineName, machineIp, language, countdown }: {
  machineName: string;
  machineIp: string;
  language: 'en' | 'es';
  countdown: number;
}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-full bg-transparent text-white p-8 select-none">
        {/* Title */}
        <div className="mb-8 text-center">
          <p className="text-xs font-mono tracking-[0.3em] text-gray-500 uppercase mb-3">
            ZeroInfra Labs
          </p>
          <h1 className="text-2xl font-bold font-mono tracking-tight" style={{ color: '#10b981' }}>
            {UI_TEXTS.deploying[language]}
          </h1>
        </div>

        {/* Countdown number */}
        <div className="relative mb-8">
          <span
            key={countdown}
            className="text-7xl font-black font-mono block text-center"
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
        <div className="mt-6 flex items-center gap-2">
          <div className="h-px w-16 bg-gray-800" />
          <span className="text-[10px] font-mono text-gray-700 tracking-widest">{UI_TEXTS.initializing[language]}</span>
          <div className="h-px w-16 bg-gray-800" />
        </div>
      </div>
      <style>{`
        @keyframes countdownPop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export function CompleteScreen({ machineName, machineIp, language, logs }: {
  machineName: string;
  machineIp: string;
  language: 'en' | 'es';
  logs: LogEntry[];
}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-full bg-transparent text-white p-8 select-none">
        {/* Checkmark circle */}
        <div className="relative mb-5">
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
        <p className="text-sm font-mono text-gray-400 mb-5">
          {machineName} — {machineIp}
        </p>

        {/* Quick log summary */}
        <div className="w-72 max-h-28 overflow-hidden font-mono text-[10px] text-gray-600 space-y-0.5 opacity-60">
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
      </div>
      <style>{`
        @keyframes completePulse {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export function LoadingScreen({ machineName, machineIp, machineOs, logs, currentLabel, progress, phaseColor }: {
  machineName: string;
  machineIp: string;
  machineOs: string;
  logs: LogEntry[];
  currentLabel: string;
  progress: number;
  phaseColor: string;
}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-full bg-transparent text-white p-8 select-none">
        {/* Machine info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-mono mb-1" style={{ color: phaseColor }}>
            {machineName}
          </h2>
          <p className="text-sm font-mono text-gray-400">
            {machineIp} <span className="text-gray-600">|</span> {machineOs}
          </p>
        </div>

        {/* Terminal-style log output */}
        <div className="w-80 max-h-32 overflow-hidden mb-5 font-mono text-sm space-y-0.5">
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
            <span style={{ color: phaseColor }}>{progress}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${phaseColor}, #22c55e)`,
                boxShadow: `0 0 12px ${phaseColor}44`,
              }}
            />
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="flex items-center gap-1 mt-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                height: `${8 + Math.random() * 8}px`,
                background: i < Math.floor(progress / 12.5) ? phaseColor : '#1f2937',
                transition: 'background 0.15s',
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes logFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}
