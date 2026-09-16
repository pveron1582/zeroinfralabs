// ── utils/storage.ts ─────────────────────────────────────────────
// Acceso centralizado a las claves propias de ZeroInfra Labs en el navegador.
//
// Motivo: el reset del lab de pruebas usaba `localStorage.clear()`, que borra TODO
// el origen (progreso de Academy, tema, idioma, wallpaper…). Este helper borra solo
// lo nuestro. Ver docs/mejoras-deep.md §2.2.

/** Claves de `localStorage` que pertenecen a la app. */
export const LOCAL_STORAGE_KEYS = {
  /** Estado persistido de Zustand (preferencias + progreso de Academy). */
  store: 'cyberops-store',
  /** Wallpaper activo del escritorio. */
  wallpaper: 'cyberops-desktop-wallpaper',
} as const;

/** Claves de `sessionStorage` que pertenecen a la app. */
export const SESSION_STORAGE_KEYS = {
  /** Id anónimo de sesión para analytics. */
  sessionId: 'cyberops-session-id',
  /** Flag de "el tour de Foxy ya se mostró". */
  foxyTour: 'foxy-tour-shown',
} as const;

/**
 * Borra SOLO las claves de ZeroInfra Labs.
 * No toca ninguna otra clave del mismo origen (y nunca usa `clear()`).
 */
export function clearZilabsStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => window.localStorage.removeItem(key));
  } catch {
    // Storage inaccesible (modo privado / cookies bloqueadas): no hay nada que borrar.
  }

  try {
    Object.values(SESSION_STORAGE_KEYS).forEach(key => window.sessionStorage.removeItem(key));
  } catch {
    // idem
  }
}