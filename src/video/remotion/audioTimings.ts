// ── video/remotion/audioTimings.ts ─────────────────────────────────
// Duración real de los audios de cada escena (en segundos).
// Generados por Voicebox con la voz "Miguel". Se usan para:
// 1. Insertar el audio en el momento correcto
// 2. Calcular durationInFrames de cada composición

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
  // ⚠️ ESTIMADOS (ci-*): duraciones aproximadas según los scripts de
  // voicebox-scripts/ci-*.txt. Se reemplazan con las reales (ffprobe)
  // cuando el autor pase los wavs.
  'ci-01-cia-triad': [18, 17, 16],
  'ci-02-hashes-cracking': [15, 16, 15],
  // ⚠️ ESTIMADOS (ci-03): Information Gathering (Fundamentos de Ciberseguridad,
  // ciber-03). Sin wavs todavía (guiones en voicebox-scripts/ci-03-*.txt). Se
  // reemplazan con las reales (ffprobe) cuando lleguen los audios; mientras
  // tanto la composición omite el <Audio> (ver hasAudio()).
  'ci-03-information-gathering': [23, 22, 22],
  // ⚠️ ESTIMADOS (ci-04): Bases de criptografía (Fundamentos de
  // Ciberseguridad, ciber-04). Sin wavs todavía (guiones en
  // voicebox-scripts/ci-04-*.txt). Se reemplazan con las reales (ffprobe)
  // cuando lleguen los audios; mientras tanto la composición omite el
  // <Audio> (ver hasAudio()).
  'ci-04-cryptography': [20, 22, 21],
  // ⚠️ ESTIMADOS (ci-05): OWASP Top Ten (Fundamentos de Ciberseguridad,
  // ciber-05). Sin wavs todavía (guiones en voicebox-scripts/ci-05-*.txt).
  // Se reemplazan con las reales (ffprobe) cuando lleguen los audios;
  // mientras tanto la composición omite el <Audio> (ver hasAudio()).
  'ci-05-owasp-top-ten': [18, 20, 22],
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
  // ⚠️ ESTIMADOS (hk-*): cracking offline/online (Pentesting, hacking-05/06).
  // Sin wavs todavía (guiones en voicebox-scripts/hk-*.txt). Se reemplazan
  // con las reales (ffprobe) cuando lleguen los audios; mientras tanto las
  // composiciones omiten el <Audio> (ver hasAudio()).
  'hk-05-offline-cracking': [22, 21, 20],
  'hk-06-online-cracking': [20, 22, 21],
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

// Ids cuyo audio todavía NO está disponible en public/videos/audio/.
// Las composiciones listadas acá omiten el <Audio> y se renderizan mudas;
// sacar el id de esta lista cuando el wav esté en su lugar.
const AUDIO_PENDING: Record<string, boolean> = {
  'ci-03-information-gathering': true,
  'ci-04-cryptography': true,
  'ci-05-owasp-top-ten': true,
  'hk-05-offline-cracking': true,
  'hk-06-online-cracking': true,
};

export function hasAudio(videoId: string): boolean {
  return !AUDIO_PENDING[videoId];
}

// Cada escena tiene padding corto entre escenas (0.3s)
export const SCENE_GAP = 0.3;

export function sceneStartFrames(videoId: string, fps: number): number[] {
  const timings = AUDIO_TIMINGS[videoId] || [];
  let acc = 0;
  const frames: number[] = [];
  for (const t of timings) {
    frames.push(Math.round(acc * fps));
    acc += t + SCENE_GAP;
  }
  return frames;
}

// Duración total incluyendo gaps
export function totalDurationSec(videoId: string): number {
  const timings = AUDIO_TIMINGS[videoId] || [];
  const sum = timings.reduce((a, b) => a + b, 0);
  return sum + SCENE_GAP * Math.max(0, timings.length - 1);
}

export function totalDurationFrames(videoId: string, fps: number): number {
  return Math.ceil(totalDurationSec(videoId) * fps) + fps; // +1s buffer final
}
