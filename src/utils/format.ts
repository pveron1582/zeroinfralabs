// ── utils/format.ts ────────────────────────────────────────────────
// Formateo compartido: tamaños de archivo y fechas virtuales.
//
// ── Límites de salida del terminal ────────────────────────────────
// Una sola llamada puede producir 1.7 MB / 100k líneas (`gobuster` sobre un
// dir grande, un exploit con streaming, un `python3` que imprime en bucle) y
// eso se queda retenido en el estado de React: la pestaña deja de responder.
// El corte va ACÁ, en el executor, que es el único choke point de la salida.

/** Máximo de líneas que se conservan de una salida. */
export const MAX_OUTPUT_LINES = 5_000;
/** Máximo de caracteres de una salida (~400 kB). */
export const MAX_OUTPUT_CHARS = 400_000;

/** Cuenta saltos de línea sin allocar el array (se corre en cada comando). */
function countLines(text: string): number {
  let n = 1;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

/**
 * Recorta una salida absurda y deja un aviso con el tamaño real. No toca la
 * metadata del CommandResponse: las validaciones de misión no dependen del
 * texto mostrado, así que una misión sigue completando igual.
 *
 * Corta por líneas Y por caracteres: 100k líneas de 3 caracteres son 300 kB
 * (pasa el tope de bytes) pero pinchan igual el render del terminal.
 */
export function capOutput(text: string): string {
  if (text.length <= MAX_OUTPUT_CHARS && countLines(text) <= MAX_OUTPUT_LINES) return text;

  const totalLines = countLines(text);
  const byChars = text.length > MAX_OUTPUT_CHARS;
  let kept = byChars ? text.slice(0, MAX_OUTPUT_CHARS) : text;
  const keptLines = countLines(kept);
  if (keptLines > MAX_OUTPUT_LINES) {
    kept = keptLines === MAX_OUTPUT_LINES ? kept : kept.slice(0, kept.lastIndexOf('\n', 0));
    const lines = kept.split('\n').slice(0, MAX_OUTPUT_LINES);
    kept = lines.join('\n');
  } else if (byChars) {
    // No cortar a mitad de línea cuando se puede evitar.
    const lastNl = kept.lastIndexOf('\n');
    if (lastNl > 0) kept = kept.slice(0, lastNl);
  }

  const motivo = byChars
    ? `${(text.length / 1024).toFixed(0)} kB de ${(text.length / 1024 / 1024).toFixed(1)} MB`
    : `${totalLines.toLocaleString('es-AR')} líneas`;
  return [
    kept,
    `[… salida recortada: ${motivo} (tope ${byChars ? `${(MAX_OUTPUT_CHARS / 1024).toFixed(0)} kB` : `${MAX_OUTPUT_LINES.toLocaleString('es-AR')} líneas`}). Filtrá con grep/head/tail para ver todo …]`,
  ].join('\n');
}

/** Máximo de entradas que se conservan en el historial de una terminal. */
export const MAX_HISTORY_ENTRIES = 400;

/**
 * Recorta el historial de la terminal. Los call sites hacen
 * `setHistory(prev => [...prev, entrada])`, así que el corte va en el setter
 * envuelto de useCommandRunner y no hay que tocar los ~10 push. Cuando se
 * descarta algo, se deja una entrada de aviso arriba (P1 3.7).
 */
export function capHistory<T extends { output?: string; command?: string | null; timestamp: number }>(
  entries: T[],
  limit: number = MAX_HISTORY_ENTRIES,
): T[] {
  if (entries.length <= limit) return entries;
  const trimmed = entries.slice(entries.length - limit);
  const aviso = {
    command: null,
    output: `[… se recortaron ${entries.length - limit} entradas anteriores del historial (tope ${limit}) …]`,
    timestamp: trimmed[0]?.timestamp ?? 0,
  } as T;
  return [aviso, ...trimmed];
}

// Antes cada comando tenía su propia copia: `ls` y `du` con K/M/G pero
// distinto umbral, `df` trabajando en MB y `sysinfo` en Ki con unidades
// "Mi/Gi", y dos hashes de mtime distintos (`ls -l` vs `stat` most Dates
// diferentes para el MISMO archivo). Acá vive una sola versión de cada
// cálculo; los comandos eligen el estilo que corresponde.

const KIB = 1024;
const MIB = KIB * 1024;
const GIB = MIB * 1024;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Sano para el formateo: NaN/Infinity/negativo → 0 (nada de "NaNG"). */
function sane(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Tamaño legible estilo `ls -h` / `du -h`: `512`, `1.2K`, `3.4M`, `5.6G`. */
export function formatBytes(bytes: number): string {
  const n = sane(bytes);
  if (n < KIB) return `${n}`;
  if (n < MIB) return `${(n / KIB).toFixed(1)}K`;
  if (n < GIB) return `${(n / MIB).toFixed(1)}M`;
  return `${(n / GIB).toFixed(1)}G`;
}

/** Tamaño legible estilo `free`: `1.2Mi`, `3.4Gi` (1024, no 1000). */
export function formatBytesBinary(bytes: number): string {
  const n = sane(bytes);
  if (n < MIB) return `${(n / KIB).toFixed(1)}Ki`;
  if (n < GIB) return `${(n / MIB).toFixed(1)}Mi`;
  return `${(n / GIB).toFixed(1)}Gi`;
}

/** Tamaño desde MiB, estilo `df`: `20.0G`, `512M`. */
export function formatMegabytes(megabytes: number): string {
  const n = sane(megabytes);
  if (n >= KIB) return `${(n / KIB).toFixed(1)}G`;
  return `${n}M`;
}

/**
 * mtime virtual y determinístico por path (el simulador no tiene reloj de
 * archivo). Es la ÚNICA fuente: `ls -l` y `stat` tienen que mostrar la misma
 * fecha para el mismo archivo.
 */
export function stableTimestamp(path: string): string {
  const h = hashPath(path || '/');
  const year = 2023 + (h % 2);
  const mon = String((Math.floor(h / 2) % 12) + 1).padStart(2, '0');
  const day = String((Math.floor(h / 24) % 28) + 1).padStart(2, '0');
  const hh = String(Math.floor(h / 672) % 24).padStart(2, '0');
  const mm = String(Math.floor(h / 16128) % 60).padStart(2, '0');
  const ss = String(Math.floor(h / 967680) % 60).padStart(2, '0');
  return `${year}-${mon}-${day} ${hh}:${mm}:${ss}.000000000 +0000`;
}

/** El mtime de `stableTimestamp` en formato corto de `ls`: `Mar 18 14:23`. */
export function formatLsDate(path: string): string {
  const [date, time] = stableTimestamp(path).split(' ');
  const [, mon, day] = date.split('-');
  return `${MONTHS[Number(mon) - 1]} ${String(Number(day)).padStart(2, ' ')} ${time.slice(0, 5)}`;
}

/** Hash estable (djb2-ish) de un path: base de las fechas virtuales y del inode simulado de `stat`. */
export function hashPath(path: string): number {
  let h = 0;
  for (let i = 0; i < path.length; i++) h = ((h << 5) - h + path.charCodeAt(i)) | 0;
  return Math.abs(h);
}
