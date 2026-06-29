import type React from 'react';

export interface Wallpaper {
  id: string;
  nameEs: string;
  nameEn: string;
  style: React.CSSProperties;
  previewGradient: string;
  gridColor: string;
  gridOpacity: number;
}

const ISO_CUBES_SVG = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <g stroke="#a5f3fc" stroke-width="1" stroke-opacity="0.25">
    <polygon points="130,180 200,145 270,180 200,215" fill="#22d3ee" fill-opacity="0.18"/>
    <polygon points="130,180 200,215 200,285 130,250" fill="#0891b2" fill-opacity="0.22"/>
    <polygon points="200,215 270,180 270,250 200,285" fill="#67e8f9" fill-opacity="0.10"/>
    <polygon points="480,300 580,250 680,300 580,350" fill="#a78bfa" fill-opacity="0.16"/>
    <polygon points="480,300 580,350 580,450 480,400" fill="#6d28d9" fill-opacity="0.22"/>
    <polygon points="580,350 680,300 680,400 580,450" fill="#c4b5fd" fill-opacity="0.10"/>
    <polygon points="800,120 860,90 920,120 860,150" fill="#6ee7b7" fill-opacity="0.16"/>
    <polygon points="800,120 860,150 860,210 800,180" fill="#059669" fill-opacity="0.22"/>
    <polygon points="860,150 920,120 920,180 860,210" fill="#a7f3d0" fill-opacity="0.10"/>
    <polygon points="900,430 980,390 1060,430 980,470" fill="#22d3ee" fill-opacity="0.16"/>
    <polygon points="900,430 980,470 980,550 900,510" fill="#0e7490" fill-opacity="0.22"/>
    <polygon points="980,470 1060,430 1060,510 980,550" fill="#67e8f9" fill-opacity="0.10"/>
    <polygon points="200,420 270,390 340,420 270,450" fill="#f59e0b" fill-opacity="0.20"/>
    <polygon points="200,420 270,450 270,520 200,490" fill="#b45309" fill-opacity="0.22"/>
    <polygon points="270,450 340,420 340,490 270,520" fill="#fbbf24" fill-opacity="0.10"/>
    <polygon points="60,550 130,520 200,550 130,580" fill="#a78bfa" fill-opacity="0.14"/>
    <polygon points="60,550 130,580 130,650 60,620" fill="#7c3aed" fill-opacity="0.18"/>
    <polygon points="130,580 200,550 200,620 130,650" fill="#c4b5fd" fill-opacity="0.08"/>
    <polygon points="700,600 780,560 860,600 780,640" fill="#6ee7b7" fill-opacity="0.14"/>
    <polygon points="700,600 780,640 780,720 700,680" fill="#047857" fill-opacity="0.18"/>
    <polygon points="780,640 860,600 860,680 780,720" fill="#a7f3d0" fill-opacity="0.08"/>
    <polygon points="1000,250 1050,225 1100,250 1050,275" fill="#f472b6" fill-opacity="0.16"/>
    <polygon points="1000,250 1050,275 1050,320 1000,295" fill="#be185d" fill-opacity="0.20"/>
    <polygon points="1050,275 1100,250 1100,295 1050,320" fill="#f9a8d4" fill-opacity="0.08"/>
  </g>
</svg>`);

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'neon-kali',
    nameEs: 'Kali Neón',
    nameEn: 'Neon Kali',
    style: {
      background: 'radial-gradient(circle at 75% 25%, rgba(16, 185, 129, 0.22) 0%, transparent 60%), radial-gradient(circle at 25% 75%, rgba(59, 130, 246, 0.18) 0%, transparent 60%), linear-gradient(135deg, rgb(2, 6, 23) 0%, rgb(11, 19, 41) 45%, rgb(2, 44, 34) 100%)',
    },
    previewGradient: 'from-slate-950 via-slate-900 to-emerald-950',
    gridColor: '#10b981',
    gridOpacity: 0.05,
  },
  {
    id: 'matrix',
    nameEs: 'Matrix Digital',
    nameEn: 'Digital Matrix',
    style: {
      background: 'linear-gradient(135deg, #020617 0%, #0a2a0a 25%, #021a0a 50%, #0a2a0a 75%, #020617 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.03) 2px, rgba(16, 185, 129, 0.03) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(16, 185, 129, 0.03) 2px, rgba(16, 185, 129, 0.03) 3px)',
    },
    previewGradient: 'from-slate-950 via-emerald-950 to-slate-950',
    gridColor: '#10b981',
    gridOpacity: 0.08,
  },
  {
    id: 'cybercity',
    nameEs: 'Cyberpunk City',
    nameEn: 'Cyberpunk City',
    style: {
      background: 'linear-gradient(135deg, #0f0a1a 0%, #1a0533 25%, #0a1633 50%, #1a0533 75%, #0f0a1a 100%), repeating-linear-gradient(0deg, transparent 0px, rgba(255, 0, 255, 0.04) 0px, rgba(255, 0, 255, 0.04) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, transparent 0px, rgba(0, 255, 255, 0.04) 0px, rgba(0, 255, 255, 0.04) 1px, transparent 1px, transparent 4px), radial-gradient(circle at 10% 90%, rgba(255, 0, 128, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(0, 200, 255, 0.12) 0%, transparent 40%)',
    },
    previewGradient: 'from-slate-950 via-fuchsia-950 to-sky-950',
    gridColor: '#d946ef',
    gridOpacity: 0.07,
  },
  {
    id: 'deep-purple',
    nameEs: 'Púrpura Profundo',
    nameEn: 'Deep Purple',
    style: {
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0a1a2e 50%, #1a0a2e 75%, #0a0a1a 100%), repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(59, 130, 246, 0.06) 20px, rgba(59, 130, 246, 0.06) 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(139, 92, 246, 0.06) 20px, rgba(139, 92, 246, 0.06) 21px)',
    },
    previewGradient: 'from-[#0a0a1a] via-[#1a0a2e] to-[#0a1a2e]',
    gridColor: '#6366f1',
    gridOpacity: 0.08,
  },
  {
    id: 'iso-cubes',
    nameEs: 'Cubos 3D Flotantes',
    nameEn: 'Floating 3D Cubes',
    style: {
      background: `linear-gradient(135deg, #020617 0%, #0a0f24 50%, #04161f 100%), url("data:image/svg+xml,${ISO_CUBES_SVG}")`,
      backgroundSize: 'cover, cover',
      backgroundPosition: 'center, center',
      backgroundRepeat: 'no-repeat, no-repeat',
    },
    previewGradient: 'from-slate-950 via-cyan-950 to-indigo-950',
    gridColor: '#22d3ee',
    gridOpacity: 0.06,
  },
  {
    id: 'low-poly',
    nameEs: 'Cristal Low-Poly',
    nameEn: 'Low-Poly Crystal',
    style: {
      background: 'radial-gradient(circle at 70% 25%, rgba(168, 85, 247, 0.22) 0%, transparent 55%), radial-gradient(circle at 25% 75%, rgba(34, 211, 238, 0.16) 0%, transparent 55%), repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.025) 0deg 12deg, transparent 12deg 24deg), linear-gradient(135deg, #04030f 0%, #160a28 50%, #021a22 100%)',
    },
    previewGradient: 'from-slate-950 via-purple-950 to-cyan-950',
    gridColor: '#a855f7',
    gridOpacity: 0.07,
  },
];
