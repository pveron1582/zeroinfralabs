// ── utils/videoUrl.ts ─────────────────────────────────────────────
// URL base para los videos de las lecciones. Cambiar VIDEO_BASE_URL
// a la URL de tu bucket R2/CDN cuando esté listo.
//
// Ejemplo con R2:
//   export const VIDEO_BASE_URL = 'https://labvideos.<account>.r2.dev';
//   // Los videos servidos como: https://labvideos.<account>.r2.dev/videos/foo.mp4
//
// Por defecto (vacío): los videos se sirven desde el mismo dominio
// (public/videos/ en el build de Vite).
export const VIDEO_BASE_URL = '';