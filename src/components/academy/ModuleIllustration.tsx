// ── components/academy/ModuleIllustration.tsx ─────────────────────
// Ilustración vectorial por módulo de la Academy, mostrada en un
// sidebar a la izquierda de la lista de lecciones (AcademyPathPage).
// Cada módulo tiene su propia escena SVG, consistente con el estilo
// de las demás ilustraciones del proyecto.

import type { ModuleIllustrationKey } from '../../types';
import { FONT_MONO } from '../landing/constants';

interface ModuleIllustrationProps {
  module: ModuleIllustrationKey;
  title: string;
  accent: string;
  isEs?: boolean;
}

export function ModuleIllustration({ module, title, accent, isEs = true }: ModuleIllustrationProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border select-none"
      style={{
        borderColor: `${accent}40`,
        background: `linear-gradient(160deg, ${accent}22 0%, #0a0f16 55%, #0a0f16 100%)`,
        fontFamily: FONT_MONO,
      }}
    >
      <Scene module={module} accent={accent} />
      <div
        className="absolute bottom-2 left-0 right-0 text-center px-3"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
      >
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            color: accent,
            background: `${accent}18`,
            border: `1px solid ${accent}40`,
          }}
        >
          {isEs ? 'Módulo' : 'Module'} · {title}
        </span>
      </div>
    </div>
  );
}

// ── Escenas por módulo ─────────────────────────────────────────────

function Scene({ module, accent }: { module: ModuleIllustrationKey; accent: string }) {
  switch (module) {
    case 'linux': return <LinuxScene accent={accent} />;
    case 'windows': return <WindowsScene accent={accent} />;
    case 'others': return <OthersScene accent={accent} />;
    case 'redes': return <RedesScene accent={accent} />;
    case 'protocolos': return <ProtocolosScene accent={accent} />;
    case 'protocolos-ii': return <Protocolos2Scene accent={accent} />;
    case 'ciberseguridad': return <CiberseguridadScene accent={accent} />;
    case 'hacking': return <HackingScene accent={accent} />;
    case 'hacking-web': return <HackingWebScene accent={accent} />;
    case 'bash': return <BashScene accent={accent} />;
    case 'powershell': return <PowerShellScene accent={accent} />;
    case 'python': return <PythonScene accent={accent} />;
    default: return null;
  }
}

const VIEWBOX = '0 0 240 140';

function GridBg({ accent }: { accent: string }) {
  return (
    <g stroke={`${accent}15`} strokeWidth="1">
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="140" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 30} x2="240" y2={i * 30} />
      ))}
    </g>
  );
}

function LinuxScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Terminal window */}
      <rect x="40" y="30" width="160" height="84" rx="10" fill="#0d1117" stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" />
      <rect x="40" y="30" width="160" height="18" rx="10" fill={accent} fillOpacity="0.15" />
      <circle cx="52" cy="39" r="3" fill="#f87171" />
      <circle cx="62" cy="39" r="3" fill="#fbbf24" />
      <circle cx="72" cy="39" r="3" fill="#34d399" />
      <text x="52" y="76" fill={accent} fontSize="11" fontFamily={FONT_MONO}>{'$ ls -la /etc'}</text>
      <text x="52" y="94" fill="#8b949e" fontSize="10" fontFamily={FONT_MONO}>{'drwxr-xr-x root'}</text>
      <text x="52" y="108" fill="#6b7280" fontSize="10" fontFamily={FONT_MONO}>_</text>
    </svg>
  );
}

function WindowsScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Windows logo / window */}
      <g transform="translate(78 28)">
        <rect x="0" y="0" width="44" height="44" rx="4" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.5" />
        <g fill={accent}>
          <path d="M10 8 L34 5 L34 22 L10 22 Z" />
          <path d="M10 24 L34 24 L34 41 L10 38 Z" />
        </g>
        <rect x="58" y="4" width="60" height="16" rx="4" fill="#0d1117" stroke={accent} strokeOpacity="0.4" />
        <rect x="58" y="26" width="60" height="16" rx="4" fill="#0d1117" stroke={accent} strokeOpacity="0.4" />
        <rect x="58" y="48" width="48" height="12" rx="4" fill="#0d1117" stroke={accent} strokeOpacity="0.3" />
      </g>
    </svg>
  );
}

function OthersScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Phone + router */}
      <rect x="40" y="34" width="34" height="60" rx="8" fill="#0d1117" stroke={accent} strokeOpacity="0.6" strokeWidth="1.5" />
      <line x1="50" y1="84" x2="64" y2="84" stroke={accent} strokeWidth="2" />
      <rect x="88" y="28" width="34" height="22" rx="6" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.5" />
      {[0,1,2].map(i => <line key={i} x1={95+i*7} y1="34" x2={95+i*7} y2="44" stroke={accent} strokeWidth="1.5" />)}
      <line x1="74" y1="64" x2="88" y2="42" stroke={accent} strokeWidth="1.5" strokeDasharray="3,3" />
      <rect x="130" y="40" width="40" height="24" rx="4" fill="#0d1117" stroke={accent} strokeOpacity="0.4" />
      <text x="136" y="56" fill={accent} fontSize="9" fontFamily={FONT_MONO}>{'IoT'}</text>
      <path d="M150 64 L150 88 M142 88 L158 88 M146 96 L146 104 M154 96 L154 104" stroke={accent} strokeWidth="1.5" strokeDasharray="2,2" />
    </svg>
  );
}

function RedesScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Globe + nodes */}
      <circle cx="120" cy="70" r="34" fill="none" stroke={accent} strokeWidth="2" />
      <ellipse cx="120" cy="70" rx="13" ry="34" fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="1.5" />
      <line x1="86" y1="70" x2="154" y2="70" stroke={accent} strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="52" cy="40" r="7" fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="1.5" />
      <circle cx="52" cy="100" r="7" fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="1.5" />
      <line x1="59" y1="42" x2="113" y2="62" stroke={accent} strokeWidth="1.5" strokeDasharray="3,3" />
      <line x1="59" y1="98" x2="113" y2="78" stroke={accent} strokeWidth="1.5" strokeDasharray="3,3" />
    </svg>
  );
}

function ProtocolosScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Antenna / tower sending waves */}
      <line x1="120" y1="28" x2="120" y2="96" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <line x1="120" y1="34" x2="100" y2="48" stroke={accent} strokeWidth="2.5" />
      <line x1="120" y1="34" x2="140" y2="48" stroke={accent} strokeWidth="2.5" />
      <line x1="120" y1="58" x2="96" y2="58" stroke={accent} strokeWidth="2.5" />
      <line x1="120" y1="58" x2="144" y2="58" stroke={accent} strokeWidth="2.5" />
      <path d="M88 88 Q74 88 74 74 M74 74 Q74 88 60 88" fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity="0.6" />
      <path d="M152 88 Q166 88 166 74 M166 74 Q166 88 180 88" fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  );
}

function Protocolos2Scene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Interconnected services: client → server */}
      <rect x="30" y="48" width="42" height="30" rx="6" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.5" />
      <text x="38" y="68" fill={accent} fontSize="9" fontFamily={FONT_MONO}>CLI</text>
      <rect x="168" y="44" width="46" height="38" rx="6" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.5" />
      <text x="175" y="68" fill={accent} fontSize="9" fontFamily={FONT_MONO}>SRV</text>
      <rect x="100" y="20" width="40" height="20" rx="5" fill="#0d1117" stroke={accent} strokeOpacity="0.5" />
      <rect x="100" y="88" width="40" height="20" rx="5" fill="#0d1117" stroke={accent} strokeOpacity="0.5" />
      <line x1="72" y1="58" x2="100" y2="30" stroke={accent} strokeWidth="1.5" strokeDasharray="3,3" />
      <line x1="72" y1="70" x2="100" y2="98" stroke={accent} strokeWidth="1.5" strokeDasharray="3,3" />
      <line x1="140" y1="30" x2="168" y2="55" stroke={accent} strokeWidth="1.5" strokeDasharray="3,3" />
      <line x1="140" y1="98" x2="168" y2="73" stroke={accent} strokeWidth="1.5" strokeDasharray="3,3" />
    </svg>
  );
}

function CiberseguridadScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Shield with lock */}
      <path d="M120 30 L158 44 L158 78 C158 102 142 114 120 122 C98 114 82 102 82 78 L82 44 Z"
        fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="2.5" />
      <rect x="108" y="66" width="24" height="20" rx="4" fill={accent} />
      <path d="M113 66 L113 60 A7 7 0 0 1 127 60 L127 66" fill="none" stroke={accent} strokeWidth="3" />
      <circle cx="120" cy="76" r="2.5" fill="#0a0f16" />
      <line x1="120" y1="78" x2="120" y2="82" stroke="#0a0f16" strokeWidth="2" />
    </svg>
  );
}

function HackingScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Crossed swords + terminal */}
      <g transform="translate(96 78) rotate(45)" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round">
        <line x1="0" y1="-34" x2="0" y2="10" />
        <line x1="-8" y1="-28" x2="8" y2="-28" />
        <line x1="0" y1="10" x2="-6" y2="18" />
        <line x1="0" y1="10" x2="6" y2="18" />
      </g>
      <g transform="translate(144 78) rotate(-45)" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round">
        <line x1="0" y1="-34" x2="0" y2="10" />
        <line x1="-8" y1="-28" x2="8" y2="-28" />
        <line x1="0" y1="10" x2="-6" y2="18" />
        <line x1="0" y1="10" x2="6" y2="18" />
      </g>
      <text x="48" y="34" fill={accent} fontSize="10" fontFamily={FONT_MONO} opacity="0.8">{'root@kali#'}</text>
    </svg>
  );
}

function HackingWebScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Web request going to a server */}
      <rect x="40" y="30" width="44" height="30" rx="4" fill="#0d1117" stroke={accent} strokeOpacity="0.5" />
      <text x="47" y="49" fill={accent} fontSize="9" fontFamily={FONT_MONO}>http</text>
      <rect x="156" y="28" width="46" height="34" rx="4" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1.5" />
      <text x="164" y="49" fill={accent} fontSize="9" fontFamily={FONT_MONO}>web</text>
      <path d="M84 45 Q120 20 156 45" fill="none" stroke={accent} strokeWidth="1.5" />
      <path d="M156 45 Q120 78 84 45" fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="120" cy="45" r="3" fill={accent} />
      <circle cx="92" cy="62" r="3" fill={accent} />
      <circle cx="148" cy="62" r="3" fill={accent} />
    </svg>
  );
}

function BashScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Shell prompt with $ and typed commands */}
      <rect x="36" y="34" width="168" height="72" rx="10" fill="#0d1117" stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" />
      <text x="46" y="58" fill={accent} fontSize="11" fontFamily={FONT_MONO}>{'$ ./scan.sh'}</text>
      <text x="46" y="76" fill="#8b949e" fontSize="10" fontFamily={FONT_MONO}>{'[+] host 10.0.0.1 up'}</text>
      <text x="46" y="92" fill="#34d399" fontSize="10" fontFamily={FONT_MONO}>{'$ for i in 1..254'}</text>
    </svg>
  );
}

function PowerShellScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* PowerShell prompt with blue window */}
      <rect x="36" y="34" width="168" height="72" rx="10" fill="#0d1117" stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" />
      <rect x="36" y="34" width="168" height="18" rx="10" fill={accent} fillOpacity="0.15" />
      <text x="46" y="47" fill={accent} fontSize="9" fontFamily={FONT_MONO}>Windows PowerShell</text>
      <text x="46" y="74" fill={accent} fontSize="11" fontFamily={FONT_MONO}>{'PS C:\\> Get-Process'}</text>
      <text x="46" y="92" fill="#8b949e" fontSize="10" fontFamily={FONT_MONO}>{'  System Idle Process'}</text>
    </svg>
  );
}

function PythonScene({ accent }: { accent: string }) {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full">
      <GridBg accent={accent} />
      {/* Python prompt with >>> */}
      <rect x="36" y="34" width="168" height="72" rx="10" fill="#0d1117" stroke={accent} strokeOpacity="0.5" strokeWidth="1.5" />
      <text x="46" y="60" fill={accent} fontSize="11" fontFamily={FONT_MONO}>{'>>> import socket'}</text>
      <text x="46" y="80" fill="#8b949e" fontSize="10" fontFamily={FONT_MONO}>{'>>> s.connect((ip, 80))'}</text>
      <text x="46" y="98" fill={accent} fontSize="11" fontFamily={FONT_MONO}>{'>>>'}</text>
    </svg>
  );
}