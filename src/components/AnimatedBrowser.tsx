// ── components/AnimatedBrowser.tsx ──────────────────────────────────────
// Animated Firefox browser mockup showing WordPress login → admin access

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AnimatedBrowserProps {
  url?: string;
  className?: string;
}

export function AnimatedBrowser({ url, className = '' }: AnimatedBrowserProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'login' | 'typing-user' | 'typing-pass' | 'redirecting' | 'dashboard' | 'done'>('login');
  const [typedUser, setTypedUser] = useState('');
  const [typedPass, setTypedPass] = useState('');
  const [dashPhase, setDashPhase] = useState(0); // 0-3 dashboard items appearing
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animationRef = useRef<(() => void) | null>(null);

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setPhase('login');
    setTypedUser('');
    setTypedPass('');
    setDashPhase(0);
  }, [cleanup]);

  const runAnimation = useCallback(() => {
    cleanup();

    const typeText = (text: string, delay: number, cb: (i: number) => void, done: () => void) => {
      let i = 0;
      const tick = () => {
        if (i <= text.length) {
          cb(i);
          i++;
          const t = setTimeout(tick, 70 + Math.random() * 40);
          timeoutsRef.current.push(t);
        } else {
          const t = setTimeout(done, 600);
          timeoutsRef.current.push(t);
        }
      };
      const t = setTimeout(tick, 400);
      timeoutsRef.current.push(t);
    };

    // Use animationRef for self-referencing auto-restart
    const restartCycle = () => {
      reset();
      const t = setTimeout(() => {
        setVisible(true);
        animationRef.current?.();
      }, 600);
      timeoutsRef.current.push(t);
    };

    // Phase 1: Show login page briefly
    const t0 = setTimeout(() => setPhase('typing-user'), 800);
    timeoutsRef.current.push(t0);

    // Phase 2: Type username
    typeText('admin', 70, (i) => setTypedUser('admin'.slice(0, i)), () => {
      // Phase 3: Type password
      setPhase('typing-pass');
      const passText = 'P@ssw0rd123!';
      let i = 0;
      const tickPass = () => {
        if (i <= passText.length) {
          setTypedPass(passText.slice(0, i));
          i++;
          const t = setTimeout(tickPass, 60 + Math.random() * 30);
          timeoutsRef.current.push(t);
        } else {
          // Phase 4: Redirecting
          const t = setTimeout(() => setPhase('redirecting'), 500);
          timeoutsRef.current.push(t);
          // Phase 5: Dashboard
          const t2 = setTimeout(() => setPhase('dashboard'), 1500);
          timeoutsRef.current.push(t2);
          // Phase 5b: Dashboard items appear one by one
          const t3 = setTimeout(() => setDashPhase(1), 1800);
          timeoutsRef.current.push(t3);
          const t4 = setTimeout(() => setDashPhase(2), 2200);
          timeoutsRef.current.push(t4);
          const t5 = setTimeout(() => setDashPhase(3), 2800);
          timeoutsRef.current.push(t5);
          const t6 = setTimeout(() => setPhase('done'), 3500);
          timeoutsRef.current.push(t6);
          // Auto-restart
          const t7 = setTimeout(restartCycle, 6000);
          timeoutsRef.current.push(t7);
        }
      };
      const t = setTimeout(tickPass, 200);
      timeoutsRef.current.push(t);
    });
  }, [cleanup, reset]);

  useEffect(() => {
    animationRef.current = runAnimation;
    const t = setTimeout(() => {
      setVisible(true);
      runAnimation();
    }, 400);
    return () => { clearTimeout(t); cleanup(); };
  }, [runAnimation, cleanup]);

  const dashboardUrl = url || 'http://192.168.1.11/wp-admin';
  const loginUrl = 'http://192.168.1.11/wp-login.php';
  const currentUrl = phase === 'dashboard' || phase === 'done' ? dashboardUrl : loginUrl;

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-xl overflow-hidden border shadow-2xl" style={{
        borderColor: '#a78bfa30',
        boxShadow: '0 0 30px #a78bfa15, 0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Firefox title bar */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#1e1e2e' }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-500">Firefox ESR</span>
          </div>
          <div className="w-16" />
        </div>

        {/* URL bar */}
        <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: '#2a2a3e', borderBottom: '1px solid #333355' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div className="flex-1 rounded px-2 py-1 font-mono text-xs transition-colors duration-300"
            style={{ background: '#1a1a2e', color: phase === 'redirecting' ? '#22d3ee' : '#9ca3af' }}>
            {currentUrl}
            {phase === 'redirecting' && <span className="animate-pulse ml-0.5">▎</span>}
          </div>
        </div>

        {/* Browser content */}
        <div className="relative min-h-[220px] max-h-[220px] overflow-hidden" style={{ background: '#f0f0f1' }}>
          {/* LOGIN PAGE */}
          {(phase === 'login' || phase === 'typing-user' || phase === 'typing-pass') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#f0f0f1' }}>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg">W</div>
              <div className="w-64 bg-white rounded-lg shadow p-4 space-y-3">
                <div>
                  <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Username</label>
                  <div className="w-full px-2 py-1.5 border border-gray-300 rounded text-[10px] font-mono bg-white"
                    style={{ minHeight: '24px' }}>
                    {typedUser}<span className="animate-pulse">▎</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Password</label>
                  <div className="w-full px-2 py-1.5 border border-gray-300 rounded text-[10px] font-mono bg-white"
                    style={{ minHeight: '24px' }}>
                    {phase === 'typing-pass' ? '•'.repeat(typedPass.length) : ''}<span className="animate-pulse">▎</span>
                  </div>
                </div>
                <div className="bg-blue-600 rounded py-1.5 text-center">
                  <span className="text-[9px] font-semibold text-white">
                    {phase === 'typing-pass' ? 'Logging in...' : 'Log In'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* REDIRECTING */}
          {phase === 'redirecting' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#f0f0f1' }}>
              <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span>Redirecting to dashboard...</span>
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {(phase === 'dashboard' || phase === 'done') && (
            <div className="absolute inset-0 flex flex-col" style={{ background: '#f0f0f1' }}>
              {/* WP Admin bar */}
              <div className="flex items-center justify-between px-3 py-1.5" style={{ background: '#1d2327' }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-[8px]">W</div>
                  <span className="text-[9px] text-white font-semibold">My Blog</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-green-400">● admin</span>
                  {phase === 'done' && (
                    <span className="text-[8px] text-emerald-400 font-semibold" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                      ✓ Compromised
                    </span>
                  )}
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-3 space-y-2 flex-1 overflow-hidden">
                {/* Stats cards */}
                {dashPhase >= 1 && (
                  <div className="bg-white rounded border border-gray-200 p-2" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                    <div className="text-[9px] font-bold text-gray-700 mb-1">Dashboard</div>
                    <div className="grid grid-cols-4 gap-1">
                      {[{ l: 'Posts', v: '3' }, { l: 'Pages', v: '2' }, { l: 'Comments', v: '12' }, { l: 'Users', v: '1' }].map(s => (
                        <div key={s.l} className="bg-gray-50 rounded border border-gray-200 p-1 text-center">
                          <div className="text-[9px] font-bold text-gray-800">{s.v}</div>
                          <div className="text-[7px] text-gray-500">{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SSH Credentials */}
                {dashPhase >= 2 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                    <div className="text-[9px] font-bold text-amber-800 mb-1">🔑 SSH Credentials Found</div>
                    <div className="rounded p-1.5 font-mono text-[9px] leading-relaxed" style={{ background: '#1e1e2e' }}>
                      <div className="text-gray-500"># Development server</div>
                      <div className="text-green-400">SSH_USER = root</div>
                      <div className="text-green-400">SSH_PASS = ********************</div>
                    </div>
                  </div>
                )}

                {/* Success message */}
                {dashPhase >= 3 && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-[9px] text-green-800" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                    <strong>🎉 Access granted.</strong> You have compromised the WordPress admin panel.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
