// ── utils/videoUrl.ts ─────────────────────────────────────────────
// URL base para los videos de las lecciones.
// Servidos via jsDelivr CDN desde el repo público de videos:
//   https://github.com/pveron1582/zilabs-videos
// Resuelve a: https://cdn.jsdelivr.net/gh/pveron1582/zilabs-videos@main/videos/foo.mp4
//
// Para volver a servir desde el propio dominio (public/videos/),
// dejá VIDEO_BASE_URL como cadena vacía.
export const VIDEO_BASE_URL = 'https://cdn.jsdelivr.net/gh/pveron1582/zilabs-videos@main';