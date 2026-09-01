// ── video/remotion/audioTimings.ts ─────────────────────────────────
// Duración real de los audios de cada escena (en segundos).
// Generados por Voicebox con la voz "Miguel". Se usan para:
// 1. Insertar el audio en el momento correcto
// 2. Calcular durationInFrames de cada composición

// Versión EN: duraciones de los wavs en inglés (ffprobe, 2026-08-30).
// Los wavs viven en public/videos/audio-en/<video-id>/.
export const AUDIO_TIMINGS_EN: Record<string, number[]> = {
  'li-01-linux-history': [16.40, 20.96, 22.08, 16.64],
  'li-02-shell': [16.16, 41.68, 46.16, 16.64],
  'li-03-commands': [15.84, 41.04, 15.76],
  'li-04-create-edit': [16.56, 35.36, 29.44],
  'li-05-permissions': [18.56, 38.48, 29.20, 28.48],
  'wi-01-windows-history': [28.72, 25.92, 27.28],
  'wi-02-current-versions': [24.00, 32.56, 18.16],
  'wi-03-security': [22.96, 23.28, 22.72],
  'wi-04-filesystem': [33.04, 29.28, 29.12],
  'wi-05-network-services': [30.48, 20.56, 19.68],
  'ot-01-alternative-systems': [16.80, 28.00, 33.52, 37.92],
  'ot-02-portable-devices': [13.12, 35.44, 29.20, 33.28],
  'ot-03-hacking-hardware': [21.68, 39.12, 40.08, 17.20],
  'ot-04-social-engineering': [16.32, 44.40, 38.00, 25.84],
  // Redes EN (2026-08-30): fr-* → composiciones re-0X, re1/re2 directas.
  're-01-network-types': [18.96, 20.16, 18.56],
  're-02-ip-addresses': [20.96, 27.44, 21.44],
  're-03-devices-topologies': [25.44, 25.68, 13.36],
  're-04-osi-layers': [18.80, 34.64, 16.80],
  're-05-addressing-dns': [19.44, 20.40, 19.76],
  're1-01-protocols-by-layer': [22.88, 20.32, 34.88],
  're1-02-services': [18.72, 32.32, 25.20],
  're1-03-ports': [27.28, 39.04, 29.60],
  're1-04-devices': [24.40, 34.24, 31.68],
  're1-05-vlans': [22.56, 27.60, 37.84],
  're2-01-dhcp': [24.48, 31.60, 34.32],
  're2-02-nat': [25.60, 33.12, 35.28],
  're2-03-dns': [24.32, 36.88, 41.68],
  're2-04-vpn': [25.60, 37.28, 27.28],
  're2-05-dmz': [32.00, 30.00, 22.24],
  // Hacking Ético EN (2026-08-30): completos ci-01..05, hw-01, hw-02.
  'ci-01-cia-triad': [21.12, 18.88, 13.76],
  'ci-02-hashes-cracking': [18.32, 20.48, 15.68],
  'ci-03-information-gathering': [32.88, 32.24, 35.36],
  'ci-04-cryptography': [32.88, 30.64, 33.60],
  'ci-05-owasp-top-ten': [25.20, 28.64, 34.72],
  'hw-01-web-protocols': [31.84, 32.00, 34.16],
  'hw-02-domains-subdirectories': [40.24, 40.56, 43.12],
  // Hacking Ético EN (2026-08-30): 2ª tanda pe-01..05, hw-03..05.
  'pe-01-pentest-phases': [14.08, 19.04, 14.32, 14.72, 18.80, 15.12],
  'pe-02-filesystem': [13.52, 27.28, 26.08, 16.96],
  'pe-03-offline-cracking': [31.76, 24.24, 32.32],
  'pe-04-online-cracking': [32.40, 30.56, 30.56],
  'pe-05-man-in-the-middle': [33.60, 37.76, 28.96],
  'hw-03-xss': [30.96, 36.56, 31.84],
  'hw-04-sql-injection': [26.64, 32.08, 34.08],
  'hw-05-path-traversal-lfi': [36.08, 33.44, 34.00],
  // Scripting EN (2026-08-30): sl/ps/py completos.
  'sl-01-bash-intro': [26.72, 22.96, 27.84],
  'sl-02-variables-conditionals': [22.96, 29.92, 31.36],
  'sl-03-loops-functions': [20.40, 28.16, 29.52],
  'sl-04-enumeration': [25.20, 23.52, 28.96],
  'sl-05-reverse-shells': [19.60, 27.20, 27.76],
  'ps-01-objects-pipeline': [22.16, 28.16, 24.24],
  'ps-02-variables-conditionals': [19.44, 25.04, 24.88],
  'ps-03-loops-cmdlets': [17.92, 25.76, 24.96],
  'ps-04-windows-enumeration': [16.80, 23.36, 22.80],
  'ps-05-credentials-obfuscation': [18.16, 21.20, 25.28],
  'py-01-python-intro': [20.32, 26.00, 21.60],
  'py-02-types-conditions': [15.36, 25.12, 25.20],
  'py-03-loops-libraries': [16.40, 21.44, 26.00],
  'py-04-socket-networking': [17.92, 18.88, 20.00],
  'py-05-http-requests': [19.44, 22.16, 24.40],
};

export function audioTimings(videoId: string, lang: 'es' | 'en' = 'es'): number[] {
  if (lang === 'en') return AUDIO_TIMINGS_EN[videoId] || [];
  return AUDIO_TIMINGS[videoId] || [];
}

export const AUDIO_TIMINGS: Record<string, number[]> = {
  'pe-01-pentest-phases': [12.56, 15.60, 13.92, 13.60, 16.24, 12.32],
  'li-01-linux-history': [15.28, 20.40, 19.20, 17.92],
  'pe-02-filesystem': [12.08, 23.84, 24.24, 14.48],
  'li-02-shell': [15.04, 39.12, 40.64, 14.80],
  'li-03-commands': [12.72, 36.72, 14.32],
  'li-04-create-edit': [14.72, 28.72, 26.32],
  'li-05-permissions': [17.04, 36.64, 27.68, 26.64],
  // wi-*: duraciones reales de los wavs (ffprobe, 2026-08-14).
  // Los syncs internos (RevealLine/KeyCapsule/TitleScene) están alineados
  // a los segmentos de habla medidos con silencedetect (-50dB).
  'wi-01-windows-history': [27.52, 23.60, 21.52],
  'wi-02-current-versions': [24.32, 31.76, 17.12],
  'wi-03-security': [21.44, 21.20, 23.36],
  'wi-04-filesystem': [33.44, 28.16, 27.36],
  'wi-05-network-services': [28.96, 21.60, 22.56],
  'ci-01-cia-triad': [20.08, 18.88, 13.28],
  'ci-02-hashes-cracking': [16.96, 19.12, 13.84],
  // ci-03/04/05: duraciones reales de los wavs ES (ffprobe, 2026-08-30).
  'ci-03-information-gathering': [28.96, 27.36, 31.76],
  'ci-04-cryptography': [29.60, 28.40, 32.80],
  'ci-05-owasp-top-ten': [21.92, 28.80, 35.12],
  // ot-*: duraciones reales de los wavs (ffprobe, 2026-08-15).
  'ot-01-alternative-systems': [16.48, 27.20, 32.40, 37.60],
  'ot-02-portable-devices': [12.08, 31.76, 27.76, 32.00],
  'ot-03-hacking-hardware': [18.56, 35.36, 37.60, 15.12],
  'ot-04-social-engineering': [14.00, 45.20, 37.04, 24.24],
  // re-*: duraciones reales de los wavs (ffprobe, 2026-08-17).
  // Voz "Miguel". Los syncs internos (RevealLine/KeyCapsule/TitleScene)
  // están alineados a los segmentos de habla medidos con silencedetect (-50dB).
  're-01-network-types': [18.56, 16.96, 15.52],
  're-02-ip-addresses': [20.32, 24.40, 15.92],
  're-03-devices-topologies': [21.04, 21.84, 12.40],
  're-04-osi-layers': [16.48, 27.12, 15.84],
  're-05-addressing-dns': [15.68, 17.60, 16.72],
  // pe-03/04/05: duraciones reales de los wavs (ffprobe, 2026-08-25).
  // Clases 3/4/5 de Pentesting. Los syncs internos (RevealLine/KeyCapsule/
  // TitleScene) están alineados a los segmentos de habla medidos con
  // silencedetect (-50dB). Guiones: voicebox-scripts/pe-0{3,4,5}-*.txt.
  'pe-03-offline-cracking': [26.64, 23.04, 27.60],
  'pe-04-online-cracking': [29.84, 28.32, 30.88],
  'pe-05-man-in-the-middle': [28.96, 34.32, 29.04],
  // hw-*: duraciones reales de los wavs (ffprobe, 2026-08-25).
  // Clases 1..5 de Hacking Web. Los syncs internos (RevealLine/KeyCapsule/
  // TerminalWindow) están alineados a los segmentos de habla medidos con
  // silencedetect (-50dB). Guiones: voicebox-scripts/hw-0{1..5}-*.txt.
  'hw-01-web-protocols': [30.32, 26.88, 34.96],
  'hw-02-domains-subdirectories': [34.40, 37.04, 37.52],
  'hw-03-xss': [28.64, 35.20, 27.76],
  'hw-04-sql-injection': [26.96, 29.76, 31.60],
  'hw-05-path-traversal-lfi': [34.08, 31.44, 32.80],
  // sl-*: duraciones reales de los wavs (ffprobe, 2026-08-26).
  // Clases 1..5 de Scripting Bash. Los syncs internos (RevealLine/KeyCapsule/
  // TerminalWindow) están alineados a los segmentos de habla medidos con
  // silencedetect (-50dB). Guiones: voicebox-scripts/sl-0{1..5}-*.txt.
  'sl-01-bash-intro': [22.40, 21.76, 22.32],
  'sl-02-variables-conditionals': [20.16, 25.36, 28.80],
  'sl-03-loops-functions': [19.68, 25.20, 25.36],
  'sl-04-enumeration': [20.40, 22.72, 24.56],
  'sl-05-reverse-shells': [18.72, 23.52, 24.24],
  // ps-* / py-*: duraciones reales de los wavs (ffprobe, 2026-08-26).
  // Clases 1..5 de Scripting PowerShell y Python. Los syncs internos
  // (RevealLine/KeyCapsule/TerminalWindow) están alineados a los segmentos de
  // habla medidos con silencedetect (-50dB). Guiones:
  // voicebox-scripts/ps-0{1..5}-*.txt y py-0{1..5}-*.txt.
  'ps-01-objects-pipeline': [18.88, 22.72, 19.36],
  'ps-02-variables-conditionals': [16.48, 20.88, 23.20],
  'ps-03-loops-cmdlets': [16.96, 21.36, 20.64],
  'ps-04-windows-enumeration': [16.56, 20.08, 21.12],
  'ps-05-credentials-obfuscation': [16.32, 20.08, 22.80],
  'py-01-python-intro': [16.72, 22.88, 19.20],
  'py-02-types-conditions': [13.36, 21.44, 21.12],
  'py-03-loops-libraries': [13.44, 18.24, 21.52],
  'py-04-socket-networking': [14.88, 16.00, 16.56],
  'py-05-http-requests': [16.16, 19.52, 22.64],
  // re1-*: duraciones reales de los wavs (ffprobe, 2026-08-18).
  // Los syncs internos (RevealLine/KeyCapsule/TitleScene) están alineados
  // a los segmentos de habla medidos con silencedetect (-50dB).
  're1-01-protocols-by-layer': [22.08, 18.56, 24.64],
  're1-03-ports': [25.68, 33.52, 30.08],
  're1-02-services': [21.44, 30.32, 23.60],
  're1-04-devices': [19.28, 28.80, 26.40],
  're1-05-vlans': [22.00, 24.40, 34.64],
  // re2-*: duraciones reales de los wavs (ffprobe, 2026-08-18).
  // Los syncs internos (RevealLine/KeyCapsule/TitleScene) están alineados
  // a los segmentos de habla medidos con silencedetect (-50dB).
  're2-01-dhcp': [23.36, 24.72, 32.24],
  're2-02-nat': [22.56, 32.08, 31.60],
  're2-03-dns': [23.68, 35.60, 41.44],
  're2-04-vpn': [20.88, 35.12, 28.16],
  're2-05-dmz': [27.36, 27.36, 21.12],
};

// Ids cuyo audio todavía NO está disponible en public/videos/audio-es/.
// Las composiciones listadas acá omiten el <Audio> y se renderizan mudas;
// sacar el id de esta lista cuando el wav esté en su lugar.
// (ci-03/04/05 ya tienen sus wavs ES — se sacaron de esta lista, 2026-08-30.)
const AUDIO_PENDING: Record<string, boolean> = {};

export function hasAudio(videoId: string): boolean {
  return !AUDIO_PENDING[videoId];
}

// Cada escena tiene padding corto entre escenas (0.3s)
export const SCENE_GAP = 0.3;

export function sceneStartFrames(videoId: string, fps: number, lang: 'es' | 'en' = 'es'): number[] {
  const timings = audioTimings(videoId, lang);
  let acc = 0;
  const frames: number[] = [];
  for (const t of timings) {
    frames.push(Math.round(acc * fps));
    acc += t + SCENE_GAP;
  }
  return frames;
}

// Duración total incluyendo gaps
export function totalDurationSec(videoId: string, lang: 'es' | 'en' = 'es'): number {
  const timings = audioTimings(videoId, lang);
  const sum = timings.reduce((a, b) => a + b, 0);
  return sum + SCENE_GAP * Math.max(0, timings.length - 1);
}

export function totalDurationFrames(videoId: string, fps: number, lang: 'es' | 'en' = 'es'): number {
  return Math.ceil(totalDurationSec(videoId, lang) * fps) + fps; // +1s buffer final
}

// Prefijo de carpeta de audio según idioma (public/videos/audio[-en]/)
export function audioBase(lang: 'es' | 'en'): string {
  return lang === 'en' ? 'videos/audio-en' : 'videos/audio-es';
}
