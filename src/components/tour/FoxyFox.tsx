// Zorro animado en SVG puro (sin assets externos). Parpadea y "respira".
export function FoxyFox({ size = 96 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="foxy-fox"
      role="img"
      aria-label="Foxy, la mascota del simulador"
    >
      <style>{`
        @keyframes foxy-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes foxy-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }
        .foxy-body { animation: foxy-breathe 3s ease-in-out infinite; transform-origin: 50% 100%; }
        .foxy-eye-l, .foxy-eye-r { animation: foxy-blink 4.5s infinite; transform-origin: center; }
      `}</style>

      {/* Cola */}
      <g className="foxy-body">
        <path
          d="M18 96 C4 90 6 70 20 62 C34 54 44 66 40 74 C36 82 28 88 26 92 Z"
          fill="#d97706"
        />
        <path d="M18 96 C14 94 12 88 16 84" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Cuerpo */}
      <g className="foxy-body">
        <ellipse cx="60" cy="88" rx="34" ry="30" fill="#ea580c" />
        <ellipse cx="60" cy="96" rx="20" ry="14" fill="#fdba74" opacity="0.6" />
      </g>

      {/* Cabeza */}
      <g className="foxy-body">
        {/* Orejas */}
        <path d="M34 34 L24 6 L52 22 Z" fill="#ea580c" />
        <path d="M38 30 L32 14 L50 24 Z" fill="#7c2d12" />
        <path d="M86 34 L96 6 L68 22 Z" fill="#ea580c" />
        <path d="M82 30 L88 14 L70 24 Z" fill="#7c2d12" />

        {/* Cara */}
        <path
          d="M60 26 C38 26 26 42 26 62 C26 84 40 96 60 96 C80 96 94 84 94 62 C94 42 82 26 60 26 Z"
          fill="#f97316"
        />

        {/* Cachetes blancos */}
        <ellipse cx="40" cy="66" rx="15" ry="12" fill="#fff7ed" />
        <ellipse cx="80" cy="66" rx="15" ry="12" fill="#fff7ed" />

        {/* Hocico */}
        <ellipse cx="60" cy="72" rx="18" ry="13" fill="#fff7ed" />
        <path d="M60 64 L52 70 L60 76 L68 70 Z" fill="#1c1917" />

        {/* Ojos */}
        <g className="foxy-eye-l">
          <ellipse cx="45" cy="52" rx="4.5" ry="6" fill="#1c1917" />
          <circle cx="46.5" cy="50" r="1.6" fill="#fff" />
        </g>
        <g className="foxy-eye-r">
          <ellipse cx="75" cy="52" rx="4.5" ry="6" fill="#1c1917" />
          <circle cx="76.5" cy="50" r="1.6" fill="#fff" />
        </g>

        {/* Cejas */}
        <path d="M38 44 Q45 40 52 43" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M68 43 Q75 40 82 44" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
