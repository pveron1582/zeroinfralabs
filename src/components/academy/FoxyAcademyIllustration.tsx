// ── components/academy/FoxyAcademyIllustration.tsx ───────────────────
// Ilustración vectorial animada de Foxy Cyber-Mentor para ZILabs Academy.
// Combina Foxy en un pod holográfico con tarjetas flotantes orbitando
// los pilares del aprendizaje (Sistemas, Redes, Seguridad, Scripting).

import React from 'react';
import { FoxyFox } from '../tour/FoxyFox';
import { FONT_MONO } from '../landing/constants';

interface FoxyAcademyIllustrationProps {
  isEs?: boolean;
}

export const FoxyAcademyIllustration: React.FC<FoxyAcademyIllustrationProps> = ({ isEs = true }) => {
  return (
    <div className="relative w-full h-full min-h-[260px] md:min-h-[340px] flex items-center justify-center p-4 select-none overflow-hidden">
      {/* Estilos de animación embebidos */}
      <style>{`
        @keyframes float-badge-1 {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes float-badge-2 {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-6px) rotate(-1.5deg); }
        }
        @keyframes float-badge-3 {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes float-badge-4 {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes cyber-pulse-ring {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
        @keyframes dash-flow {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scan-glow {
          0%, 100% { opacity: 0.3; transform: translateY(-20px); }
          50% { opacity: 0.8; transform: translateY(20px); }
        }
        .anim-badge-1 { animation: float-badge-1 3.8s ease-in-out infinite; }
        .anim-badge-2 { animation: float-badge-2 4.2s ease-in-out infinite 0.6s; }
        .anim-badge-3 { animation: float-badge-3 3.5s ease-in-out infinite 1.2s; }
        .anim-badge-4 { animation: float-badge-4 4.0s ease-in-out infinite 1.8s; }
        .anim-pulse-ring { animation: cyber-pulse-ring 3.5s ease-in-out infinite; transform-origin: center; }
        .anim-dash { animation: dash-flow 1.5s linear infinite; }
        .anim-scan { animation: scan-glow 4s ease-in-out infinite; }
      `}</style>

      {/* Grid de fondo y resplandor central */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,rgba(6,182,212,0.08)_40%,transparent_75%)] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* SVG de circuitos y conexiones holográficas */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyberLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Círculos concéntricos de la plataforma holográfica */}
        <g transform="translate(160, 195)">
          {/* Anillos de luz */}
          <ellipse cx="0" cy="0" rx="76" ry="24" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.3" fill="rgba(16, 185, 129, 0.05)" />
          <ellipse cx="0" cy="0" rx="58" ry="18" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="6 4" className="anim-dash" />
          <ellipse cx="0" cy="0" rx="42" ry="13" stroke="#10b981" strokeWidth="2" strokeOpacity="0.8" className="anim-pulse-ring" filter="url(#glow)" />
          {/* Marcadores cardinales */}
          <circle cx="0" cy="-24" r="2.5" fill="#10b981" />
          <circle cx="0" cy="24" r="2.5" fill="#10b981" />
          <circle cx="-76" cy="0" r="2.5" fill="#06b6d4" />
          <circle cx="76" cy="0" r="2.5" fill="#06b6d4" />
        </g>

        {/* Líneas de datos hacia las tarjetas flotantes */}
        {/* Hacia Top-Left (OS) */}
        <path
          d="M 140 180 L 80 120 L 70 85"
          stroke="url(#cyberLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="anim-dash"
        />
        {/* Hacia Top-Right (Redes) */}
        <path
          d="M 180 180 L 240 120 L 250 85"
          stroke="url(#cyberLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="anim-dash"
        />
        {/* Hacia Bottom-Left (Seguridad) */}
        <path
          d="M 130 205 L 65 240 L 55 260"
          stroke="url(#cyberLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="anim-dash"
        />
        {/* Hacia Bottom-Right (Scripting) */}
        <path
          d="M 190 205 L 255 240 L 265 260"
          stroke="url(#cyberLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          className="anim-dash"
        />

        {/* Partículas de datos flotantes */}
        <text x="35" y="145" fill="#10b981" fontSize="8" fontFamily="monospace" opacity="0.4">0101</text>
        <text x="260" y="165" fill="#06b6d4" fontSize="8" fontFamily="monospace" opacity="0.4">0x90</text>
        <text x="145" y="45" fill="#10b981" fontSize="9" fontFamily="monospace" opacity="0.5">root#</text>
      </svg>

      {/* ── FOXY CENTRAL CON VISOR CYBER ── */}
      <div className="relative z-10 flex flex-col items-center justify-center my-2">
        {/* Halo resplandeciente detrás de Foxy */}
        <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative transition-transform duration-300 hover:scale-105">
          {/* Foxy animado nativo */}
          <FoxyFox size={92} />

          {/* Cyber Visor / HUD Overlay sobre Foxy */}
          <div className="absolute top-[32px] left-[34px] pointer-events-none">
            <svg width="34" height="18" viewBox="0 0 34 18" fill="none">
              {/* Marco visor cyan neón */}
              <path
                d="M 2 8 L 8 3 L 26 3 L 32 8 L 26 14 L 8 14 Z"
                fill="rgba(6, 182, 212, 0.35)"
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
              {/* Scanline interactiva */}
              <line x1="6" y1="9" x2="28" y2="9" stroke="#67e8f9" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="24" cy="8" r="1.5" fill="#10b981" />
            </svg>
          </div>
        </div>

        {/* Chip inferior: MODO ACADEMY */}
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/50 backdrop-blur-md"
          style={{ fontFamily: FONT_MONO }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
            {isEs ? 'Mentor Interactivo' : 'Interactive Mentor'}
          </span>
        </div>
      </div>

      {/* ── 4 TARJETAS HOLOGRÁFICAS FLOTANTES ── */}

      {/* 1. TOP-LEFT: Sistemas (Linux/Windows) */}
      <div className="anim-badge-1 absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-black/60 backdrop-blur-md text-slate-200 hover:border-emerald-400 transition-colors">
          <span className="text-xs">🐧</span>
          <span className="text-[10px] font-bold font-mono text-emerald-300">
            {isEs ? 'SO & Kernel' : 'OS & Kernel'}
          </span>
        </div>
      </div>

      {/* 2. TOP-RIGHT: Redes (TCP/IP) */}
      <div className="anim-badge-2 absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-lg shadow-black/60 backdrop-blur-md text-slate-200 hover:border-cyan-400 transition-colors">
          <span className="text-xs">🌐</span>
          <span className="text-[10px] font-bold font-mono text-cyan-300">
            {isEs ? 'Redes & Tráfico' : 'Networks & IP'}
          </span>
        </div>
      </div>

      {/* 3. BOTTOM-LEFT: Ciberseguridad (CID) */}
      <div className="anim-badge-3 absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/90 border border-purple-500/40 shadow-lg shadow-black/60 backdrop-blur-md text-slate-200 hover:border-purple-400 transition-colors">
          <span className="text-xs">🛡️</span>
          <span className="text-[10px] font-bold font-mono text-purple-300">
            {isEs ? 'Fundamentos CID' : 'CIA Triad'}
          </span>
        </div>
      </div>

      {/* 4. BOTTOM-RIGHT: Scripting & Tools */}
      <div className="anim-badge-4 absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg shadow-black/60 backdrop-blur-md text-slate-200 hover:border-amber-400 transition-colors">
          <span className="text-xs">💻</span>
          <span className="text-[10px] font-bold font-mono text-amber-300">
            {isEs ? 'Scripting & Lab' : 'Scripting & Lab'}
          </span>
        </div>
      </div>
    </div>
  );
};
