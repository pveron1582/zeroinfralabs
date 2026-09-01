// ── components/academy/AcademyVideo.tsx ────────────────────────────
// Reproductor de video para los pasos `video` del Academy.
// Videos pre-renderizados con Remotion → /public/videos/es|en/*.mp4.
// Chrome estilo ventana oscura, como los demos del landing.

import { useState } from 'react';
import { FONT_MONO, FONT_SANS } from '../landing/constants';
import { VIDEO_BASE_URL } from '../../utils/videoUrl';

interface AcademyVideoProps {
  src: string;
  srcEn?: string;
  poster?: string;
  durationSec: number;
  caption?: string;
  captionEs?: string;
  isEs: boolean;
}

export function AcademyVideo({ src, srcEn, poster, durationSec, caption, captionEs, isEs }: AcademyVideoProps) {
  const [playing, setPlaying] = useState(false);
  const captionText = isEs ? (captionEs || caption) : (caption || captionEs);
  // ES usa src; EN usa srcEn si existe, si no el original
  const baseSrc = !isEs && srcEn ? srcEn : src;
  const resolvedSrc = VIDEO_BASE_URL ? `${VIDEO_BASE_URL}${baseSrc}` : baseSrc;
  const resolvedPoster = poster && VIDEO_BASE_URL ? `${VIDEO_BASE_URL}${poster}` : poster;

  return (
    <div className="rounded-xl overflow-hidden border shadow-2xl" style={{ borderColor: '#1e293b', fontFamily: FONT_SANS }}>
      {/* Barra título estilo ventana */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/95 border-b border-slate-800/80">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-[10px] text-slate-400" style={{ fontFamily: FONT_MONO }}>
          video · {durationSec}s
        </span>
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded font-bold" style={{ fontFamily: FONT_MONO, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
          ZILABS
        </span>
      </div>

      {/* Video */}
      <div className="relative" style={{ background: '#050a08' }}>
        <video
          src={resolvedSrc}
          poster={resolvedPoster}
          controls
          className="w-full block"
          style={{ maxHeight: '400px' }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {isEs ? 'Tu navegador no soporta video.' : 'Your browser does not support video.'}
        </video>
        {!playing && !poster && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(5,10,8,0.5)' }}>
            <div className="text-5xl" style={{ color: '#e5e7eb' }}>▶</div>
          </div>
        )}
      </div>

      {/* Caption / subtítulo */}
      {captionText && (
        <div className="px-4 py-3 text-xs leading-relaxed bg-slate-900/95 border-t border-slate-800/80">
          <span className="text-emerald-400 font-bold mr-2">{isEs ? 'Nota:' : 'Note:'}</span>
          <span className="text-slate-300">{captionText}</span>
        </div>
      )}
    </div>
  );
}
