// ── components/desktop/icons.tsx ───────────────────────────────────
// Íconos de aplicaciones del escritorio simulado, dibujados como SVGs
// propios con estética flat tipo temas de Linux (Papirus/Breeze):
// fondo squircle con gradiente sutil + glifo. Sin emojis ni assets de
// terceros (sin problemas de licencia) y render idéntico en todos los SO.

import React from 'react';

interface IconProps {
  /** Tamaño en px (los íconos son cuadrados) */
  size?: number;
}

const SQUIRCLE_GRADIENTS = (
  <defs>
    <linearGradient id="zi-icon-dark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2b3542" />
      <stop offset="100%" stopColor="#151c26" />
    </linearGradient>
    <linearGradient id="zi-icon-orange" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fb923c" />
      <stop offset="100%" stopColor="#ea580c" />
    </linearGradient>
    <linearGradient id="zi-icon-red" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#f87171" />
      <stop offset="100%" stopColor="#dc2626" />
    </linearGradient>
    <linearGradient id="zi-icon-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#38bdf8" />
      <stop offset="55%" stopColor="#7dd3fc" />
      <stop offset="55%" stopColor="#0ea5e9" />
      <stop offset="100%" stopColor="#0284c7" />
    </linearGradient>
  </defs>
);

/** Terminal: squircle oscuro con prompt ">_" esmeralda (estilo gnome-terminal) */
export const TerminalAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    {SQUIRCLE_GRADIENTS}
    <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#zi-icon-dark)" stroke="#3b4757" strokeWidth="1" />
    <path d="M8 11l6 5-6 5" fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="17" y1="21" x2="24" y2="21" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

/** Navegador: marca tipo Chrome (anillo tricolor + núcleo azul) */
export const ChromeAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="13.5" fill="#f1f3f4" />
    <path d="M16 2.5a13.5 13.5 0 0 1 11.69 6.75H16a6.75 6.75 0 0 0-5.85 3.37L4.31 9.25A13.5 13.5 0 0 1 16 2.5z" fill="#ea4335" />
    <path d="M4.31 9.25l5.84 10.13a6.75 6.75 0 0 0 5.85 3.37c.53 0 1.05-.06 1.54-.18L13.6 29.3A13.5 13.5 0 0 1 4.31 9.25z" fill="#34a853" />
    <path d="M27.69 9.25A13.5 13.5 0 0 1 16 29.5c-.72 0-1.43-.06-2.12-.16l5.87-10.17A6.73 6.73 0 0 0 21.85 16c0-1.25-.34-2.42-.93-3.42L27.69 9.25z" fill="#fbbc05" />
    <circle cx="16" cy="16" r="5.4" fill="#4285f4" stroke="#f1f3f4" strokeWidth="1.6" />
  </svg>
);

/** Burp Suite: squircle naranja con la B blanca */
export const BurpAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    {SQUIRCLE_GRADIENTS}
    <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#zi-icon-orange)" stroke="#c2410c" strokeWidth="1" />
    <text x="16" y="22.5" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="17" fontWeight="700" fill="#fff">B</text>
  </svg>
);

/** Manual PDF: documento rojo con doblez y líneas de texto */
export const ManualAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    {SQUIRCLE_GRADIENTS}
    <path d="M7 2h13l6 6v20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" transform="translate(1 1)" fill="url(#zi-icon-red)" stroke="#b91c1c" strokeWidth="1" />
    <path d="M21 3v5a1 1 0 0 0 1 1h5" transform="translate(1 1)" fill="#fecaca" opacity="0.85" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.92">
      <line x1="12" y1="16" x2="22" y2="16" />
      <line x1="12" y1="20" x2="22" y2="20" />
      <line x1="12" y1="24" x2="18" y2="24" />
    </g>
  </svg>
);

/** Fondo de pantalla: monitor con paisaje (sol + montañas) */
export const WallpaperAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    {SQUIRCLE_GRADIENTS}
    <rect x="2" y="4" width="28" height="19" rx="3" fill="url(#zi-icon-sky)" stroke="#475569" strokeWidth="1.4" />
    <circle cx="10.5" cy="10.5" r="3" fill="#fef08a" />
    <path d="M2 20l7-7 5 5 5-6 11 9v2H2v-3z" fill="#059669" opacity="0.95" />
    <rect x="11" y="26" width="10" height="2.6" rx="1.3" fill="#64748b" />
  </svg>
);

/** Foxy: cara de zorro estilizada en ámbar */
export const FoxyAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    {SQUIRCLE_GRADIENTS}
    <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#zi-icon-dark)" stroke="#3b4757" strokeWidth="1" />
    <path d="M6 8l6 4h8l6-4-1.5 9c0 5-3.5 9-8.5 9s-8.5-4-8.5-9L6 8z" fill="#f59e0b" />
    <path d="M6 8l6 4-2.5 5L6 8zM26 8l-6 4 2.5 5L26 8z" fill="#fbbf24" />
    <path d="M16 17l2.5 3.5h-5L16 17z" fill="#78350f" />
    <circle cx="11.5" cy="15" r="1.4" fill="#451a03" />
    <circle cx="20.5" cy="15" r="1.4" fill="#451a03" />
  </svg>
);

/** Info ("Acerca de"): círculo con i, trazo slate */
export const InfoIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </svg>
);
