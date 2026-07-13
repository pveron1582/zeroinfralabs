// ── components/AnimatedDesktop.tsx ─────────────────────────────────
// Landing demo: simulated Kali desktop with transparent terminal + Chrome
// Loops like a short GIF — terminal gobuster → browser wp-admin login

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WALLPAPERS } from './desktopWallpapers';
import { GOBUSTER_DEMO, FONT_MONO } from './landing/constants';

type Phase = 'idle' | 'term-cmd' | 'term-out' | 'browser' | 'browser-pass' | 'browser-dash' | 'hold';

interface AnimatedDesktopProps {
  className?: string;
  isEs?: boolean;
}

export function AnimatedDesktop({ className = '', isEs = false }: AnimatedDesktopProps) {
  const wp = WALLPAPERS.find(w => w.id === 'neon-kali') ?? WALLPAPERS[0];
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [typedCmd, setTypedCmd] = useState('');
  const [termLines, setTermLines] = useState<string[]>([]);
  const [browserUser, setBrowserUser] = useState('');
  const [browserPass, setBrowserPass] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mounted = useRef(true);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      if (mounted.current) fn();
    }, ms);
    timers.current.push(id);
  }, []);

  const runCycle = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setTypedCmd('');
    setTermLines([]);
    setBrowserUser('');
    setBrowserPass('');
    setShowBrowser(false);
    setShowTerminal(false);

    schedule(() => {
      setShowTerminal(true);
      setPhase('term-cmd');

      let ci = 0;
      const cmd = GOBUSTER_DEMO.command;
      const typeCmd = () => {
        if (ci <= cmd.length) {
          setTypedCmd(cmd.slice(0, ci));
          ci++;
          schedule(typeCmd, 55 + Math.random() * 25);
        } else {
          schedule(() => {
            setPhase('term-out');
            let li = 0;
            const showLine = () => {
              if (li < GOBUSTER_DEMO.outputLines.length) {
                const line = GOBUSTER_DEMO.outputLines[li];
                li++;
                setTermLines(prev => [...prev, line]);
                schedule(showLine, 160);
              } else {
                schedule(() => {
                  setShowBrowser(true);
                  setPhase('browser');
                  let ui = 0;
                  const user = 'admin';
                  const typeUser = () => {
                    if (ui <= user.length) {
                      setBrowserUser(user.slice(0, ui));
                      ui++;
                      schedule(typeUser, 90);
                    } else {
                      schedule(() => {
                        setPhase('browser-pass');
                        let pi = 0;
                        const pass = 'P@ssw0rd!';
                        const typePass = () => {
                          if (pi <= pass.length) {
                            setBrowserPass(pass.slice(0, pi));
                            pi++;
                            schedule(typePass, 70 + Math.random() * 30);
                          } else {
                            schedule(() => {
                              setPhase('browser-dash');
                              schedule(() => {
                                setPhase('hold');
                                schedule(runCycle, 2800);
                              }, 2200);
                            }, 600);
                          }
                        };
                        schedule(typePass, 200);
                      }, 400);
                    }
                  };
                  schedule(typeUser, 350);
                }, 500);
              }
            };
            showLine();
          }, 350);
        }
      };
      schedule(typeCmd, 400);
    }, 500);
  }, [clearTimers, schedule]);

  // Mount-based loop (no IntersectionObserver — layout shifts were killing the animation)
  useEffect(() => {
    mounted.current = true;
    const boot = setTimeout(() => {
      setReady(true);
      runCycle();
    }, 300);
    return () => {
      mounted.current = false;
      clearTimeout(boot);
      clearTimers();
    };
  }, [runCycle, clearTimers]);

  return (
    <div className={`w-full select-none ${className}`}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.5s ease-out' }}>
      <div className="rounded-2xl overflow-hidden border shadow-2xl" style={{ borderColor: '#1e293b' }}>
        <div className="relative w-full overflow-hidden bg-slate-950" style={{ aspectRatio: '16/10', minHeight: 280, maxHeight: 520 }}>
          {/* Wallpaper — always visible */}
          <div className="absolute inset-0 z-0" style={wp.style}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle, ${wp.gridColor} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              opacity: wp.gridOpacity,
            }} />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-30 h-7 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between px-2.5 text-[10px] text-slate-300 font-sans backdrop-blur-md">
            <div className="flex items-center gap-1 min-w-0">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-slate-950 font-semibold shrink-0">
                <span className="w-3 h-3 rounded bg-emerald-500 text-[8px] font-bold flex items-center justify-center text-slate-950">K</span>
                {isEs ? 'Aplicaciones' : 'Applications'}
              </span>
              {showTerminal && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-slate-950 font-semibold shrink-0">
                  <span className="text-emerald-300 font-mono font-bold">&gt;_</span> Terminal 1
                </span>
              )}
              {showBrowser && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-orange-400 shrink-0">
                  <span>🌐</span> Chrome 1
                </span>
              )}
            </div>
            <span className="text-slate-500 font-mono shrink-0">14:32</span>
          </div>

          {/* Desktop icons */}
          <div className="absolute top-9 left-3 z-20 flex flex-col gap-4">
            <DesktopIcon label="Terminal" color="text-emerald-400" terminal />
            <DesktopIcon label="Chrome" color="text-orange-400" />
          </div>

          {showTerminal && (
            <DemoWindow title="Terminal 1 - root@kali" type="terminal" opacity={0.55}
              box={{ left: '5%', top: '13%', width: '50%', height: '60%' }} zIndex={20}>
              <div className="p-2.5 h-full overflow-hidden text-[9px] md:text-[10px] leading-relaxed" style={{ fontFamily: FONT_MONO }}>
                <div className="text-emerald-400 mb-1 whitespace-nowrap overflow-hidden">
                  root@kali:~# <span className="text-slate-200">{typedCmd}</span>
                  {phase === 'term-cmd' && <span className="animate-pulse">▎</span>}
                </div>
                {termLines.map((line, i) => (
                  <div key={i} className={line.includes('Status:') ? 'text-emerald-300/90' : line.includes('Progress:') ? 'text-cyan-300' : 'text-slate-400'}>
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </DemoWindow>
          )}

          {showBrowser && (
            <DemoWindow title="Chrome 1" type="browser" opacity={1}
              box={{ left: '36%', top: '20%', width: '56%', height: '64%' }} zIndex={30}>
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2a2a3e] border-b border-slate-700 shrink-0">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span className="flex-1 rounded px-1.5 py-0.5 font-mono text-[8px] text-slate-400 bg-[#1a1a2e] truncate">
                    {phase === 'browser-dash' || phase === 'hold'
                      ? 'http://192.168.1.11/wp-admin/dashboard'
                      : 'http://192.168.1.11/wp-admin'}
                  </span>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden bg-[#f0f0f1]">
                  {phase === 'browser-dash' || phase === 'hold' ? (
                    <div className="p-2 space-y-1.5 h-full">
                      <div className="bg-green-50 border border-green-200 rounded p-1.5 text-[8px] text-green-800">
                        <strong>🎉</strong> {isEs ? 'Panel comprometido' : 'Admin panel compromised'}
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded p-1.5">
                        <div className="text-[8px] font-bold text-amber-800 mb-0.5">🔑 SSH Credentials</div>
                        <div className="rounded p-1 font-mono text-[7px] bg-slate-900 text-green-400">admin:SSHCREDENTIALS</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">W</div>
                      <div className="w-full max-w-[140px] bg-white rounded shadow p-2 space-y-1.5">
                        <div className="text-[7px] text-gray-500">Username</div>
                        <div className="border rounded px-1.5 py-1 text-[8px] font-mono min-h-[22px]">
                          {browserUser || '\u00A0'}
                          {phase === 'browser' && <span className="animate-pulse">▎</span>}
                        </div>
                        <div className="text-[7px] text-gray-500">Password</div>
                        <div className="border rounded px-1.5 py-1 text-[8px] font-mono min-h-[22px]">
                          {'•'.repeat(browserPass.length) || '\u00A0'}
                          {phase === 'browser-pass' && <span className="animate-pulse">▎</span>}
                        </div>
                        <div className="bg-blue-600 rounded py-1 text-center text-[7px] text-white font-semibold">
                          {phase === 'browser-pass' ? 'Logging in...' : 'Log In'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DemoWindow>
          )}

          <div className="absolute bottom-2 right-3 z-40 px-2 py-1 rounded-md text-[9px] font-mono text-emerald-400/80 bg-slate-900/70 border border-emerald-500/20 backdrop-blur-sm">
            {phase === 'idle' && (isEs ? 'Escritorio Kali' : 'Kali Desktop')}
            {(phase === 'term-cmd' || phase === 'term-out') && 'gobuster dir'}
            {phase === 'browser' && 'wp-admin'}
            {phase === 'browser-pass' && (isEs ? 'Iniciando sesión...' : 'Logging in...')}
            {(phase === 'browser-dash' || phase === 'hold') && (isEs ? '¡Comprometido!' : 'Pwned!')}
          </div>
        </div>
      </div>
      <style>{`@keyframes demoWinIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

function DesktopIcon({ label, color, terminal }: { label: string; color: string; terminal?: boolean }) {
  return (
    <div className="flex flex-col items-center w-12">
      <div className={`w-9 h-9 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-xs shadow-lg ${color}`}>
        {terminal
          ? <span className="font-mono font-bold text-sm">&gt;_</span>
          : <span>🌐</span>}
      </div>
      <span className="text-[8px] text-slate-300 mt-0.5 drop-shadow">{label}</span>
    </div>
  );
}

function DemoWindow({ title, type, opacity, box, zIndex, children }: {
  title: string; type: 'terminal' | 'browser'; opacity: number;
  box: { left: string; top: string; width: string; height: string };
  zIndex: number; children: React.ReactNode;
}) {
  return (
    <div className="absolute flex flex-col rounded-lg border border-slate-700/70 shadow-2xl overflow-hidden"
      style={{
        left: box.left, top: box.top, width: box.width, height: box.height, zIndex,
        animation: 'demoWinIn 0.4s ease-out both',
      }}>
      <div className="h-6 bg-slate-950 border-b border-slate-800 px-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 text-[9px] text-slate-400 min-w-0">
          <span className={type === 'terminal' ? 'text-emerald-500 font-mono shrink-0' : 'text-orange-400 shrink-0'}>
            {type === 'terminal' ? '>' : '🌐'}
          </span>
          <span className="truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {type === 'terminal' && (
            <span className="text-[8px] font-mono text-slate-500 border border-slate-800 px-1 rounded">{Math.round(opacity * 100)}%</span>
          )}
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden"
        style={type === 'terminal' ? { background: `rgba(15, 23, 42, ${opacity})` } : { background: '#f0f0f1' }}>
        {children}
      </div>
    </div>
  );
}
