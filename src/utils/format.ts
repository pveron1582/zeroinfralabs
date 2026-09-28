// ── utils/format.ts ────────────────────────────────────────────────
// Formateo compartido: tamaños de archivo y fechas virtuales.
//
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
