// ── components/MachineLoader.tsx ─────────────────────────────────
import React from 'react';

interface Props {
  machineName: string;
  machineIp: string;
  machineOs: string;
  onComplete: () => void;
}

export function MachineLoader({ machineName, machineIp, machineOs, onComplete }: Props) {
  const [progress, setProgress] = React.useState(0);
  const [phase, setPhase] = React.useState<'scanning' | 'initializing' | 'loading' | 'complete'>('scanning');

  React.useEffect(() => {
    const phases = [
      { name: 'scanning', duration: 1200, label: 'Scanning network...' },
      { name: 'initializing', duration: 1500, label: 'Initializing services...' },
      { name: 'loading', duration: 1800, label: 'Loading system...' },
      { name: 'complete', duration: 500, label: 'Ready' }
    ];

    let currentPhase = 0;
    let accumulated = 0;

    const interval = setInterval(() => {
      const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);
      const current = phases[currentPhase];
      
      accumulated += 50;
      const phaseProgress = (accumulated / current.duration) * 100;
      const overallProgress = Math.min(100, (accumulated / totalDuration) * 100);

      setProgress(Math.floor(overallProgress));
      setPhase(current.name as any);

      if (phaseProgress >= 100) {
        currentPhase++;
        accumulated = 0;
        
        if (currentPhase >= phases.length) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'scanning': return 'Scanning network...';
      case 'initializing': return 'Initializing services...';
      case 'loading': return 'Loading system...';
      case 'complete': return 'Ready';
      default: return '';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'scanning': return '#3b82f6'; // Azul
      case 'initializing': return '#f59e0b'; // Naranja
      case 'loading': return '#10b981'; // Verde
      case 'complete': return '#22c55e'; // Verde brillante
      default: return '#6b7280';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-950 text-white p-8">
      {/* Logo/Círculo de carga */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-gray-700 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-500 border-t-emerald-400 animate-spin" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
             style={{ boxShadow: `0 0 20px ${getPhaseColor()}` }}>
          <div className="w-4 h-4 rounded-full bg-white" />
        </div>
      </div>

      {/* Información de la máquina */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: getPhaseColor() }}>
          {machineName}
        </h2>
        <p className="text-sm text-gray-400 mb-1">IP: {machineIp}</p>
        <p className="text-sm text-gray-400">OS: {machineOs}</p>
      </div>

      {/* Estado de carga */}
      <div className="w-64 mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{getPhaseLabel()}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-50"
            style={{ 
              width: `${progress}%`, 
              background: `linear-gradient(90deg, ${getPhaseColor()}, #22c55e)` 
            }}
          />
        </div>
      </div>

      {/* Efectos visuales */}
      <div className="flex gap-1 text-xs text-gray-500">
        <span className="animate-pulse">█</span>
        <span className="animate-pulse" style={{ animationDelay: '100ms' }}>█</span>
        <span className="animate-pulse" style={{ animationDelay: '200ms' }}>█</span>
        <span className="animate-pulse" style={{ animationDelay: '300ms' }}>█</span>
        <span className="animate-pulse" style={{ animationDelay: '400ms' }}>█</span>
      </div>

      {/* Mensaje final */}
      {phase === 'complete' && (
        <div className="mt-6 text-center text-emerald-400 font-mono text-sm animate-pulse">
          System loaded. Ready for attack.
        </div>
      )}
    </div>
  );
}