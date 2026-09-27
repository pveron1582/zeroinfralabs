// ── utils/winPath.ts ──────────────────────────────────────────────
// Rutas Windows para el FS virtual (PLAN_WINDOWS W0).
// fs-windows guarda rutas canónicas con separador "/" y prefijo "/X:"
// (ej. /C:/Users/admin), así findFile/findDirEntry/permisos no cambian.
// Estos helpers convierten lo que tipea el usuario (C:\Users\x, C:/...,
// \Users\..., relativas, ~) a esa forma canónica.

/** ¿La ruta tiene forma Windows? (C:\, C:/, C: o /C:/) */
export function isWinPath(p: string): boolean {
  return /^[A-Za-z]:([\\/]|$)/.test(p) || /^\/[A-Za-z]:(\/|$)/.test(p);
}

/** Forma canónica: separador "/", prefijo "/X:", resuelve ./.., sin trailing slash. */
export function normalizeWinPath(raw: string): string {
  let s = raw.replace(/\\/g, '/');
  if (/^[A-Za-z]:/.test(s)) s = '/' + s;
  s = s.replace(/\/{2,}/g, '/');
  // Unidad canónica SIEMPRE en mayúscula: el FS usa /C:/ y quien tipea
  // `cd c:\` (minúscula) debe caer en /C:/.dir, no en /c:/.dir (no existe).
  s = s.replace(/^\/([a-z]:)/, m => '/' + m.slice(1).toUpperCase());
  const parts = s.split('/');
  if (parts.length >= 2 && /^[A-Za-z]:$/.test(parts[1])) {
    const rest: string[] = [];
    for (let i = 2; i < parts.length; i++) {
      const seg = parts[i];
      if (seg === '' || seg === '.') continue;
      if (seg === '..') { rest.pop(); continue; }
      rest.push(seg);
    }
    return '/' + parts[1] + (rest.length ? '/' + rest.join('/') : '');
  }
  const generic: string[] = [];
  for (const seg of parts) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { generic.pop(); continue; }
    generic.push(seg);
  }
  return '/' + generic.join('/');
}

/** Unidad de una ruta ('/C:'), o null si no tiene. */
function driveOf(p: string): string | null {
  const m = (p || '').replace(/\\/g, '/').match(/\/?([A-Za-z]:)(\/|$)/);
  return m ? '/' + m[1].toUpperCase() : null;
}

/** Forma canónica (/C:/Users/x) → forma de cmd para mostrar (C:\Users\x). */
export function winDisplay(canonical: string): string {
  const p = normalizeWinPath(canonical || '');
  if (/^\/[A-Za-z]:/.test(p)) {
    const drive = p.slice(1, 3);
    const rest = p.slice(3).replace(/^\//, '');
    return drive + (rest ? '\\' + rest.replace(/\//g, '\\') : '\\');
  }
  return p || 'C:\\';
}

/**
 * Resuelve una ruta Windows como hace cmd: absoluta con unidad (C:\...),
 * absoluta desde la raíz de la unidad actual (\Users\x), relativa al cwd
 * o con ~ (home). Devuelve forma canónica lista para findFile.
 */
export function resolveWinPath(target: string, currentDir: string, homeDir: string): string {
  const home = isWinPath(homeDir) ? normalizeWinPath(homeDir) : '/C:/Users/user';
  const cwd = currentDir && isWinPath(currentDir) ? normalizeWinPath(currentDir) : '';

  if (!target || target === '.' || target === './' || target === '.\\') return cwd || home;
  if (target === '/' || target === '\\') return driveOf(cwd) || driveOf(home) || '/C:';
  if (target === '~') return home;
  if (target.startsWith('~')) {
    return normalizeWinPath(home + '/' + target.slice(1).replace(/^[\\/]/, ''));
  }

  const t = target.replace(/\\/g, '/');
  // Absoluta con unidad: C:/..., C:\... (ya convertido) o /C:/... (canónica)
  if (isWinPath(t)) return normalizeWinPath(t);
  // Absoluta de unidad actual: \Users\x → /Users/x → currentDrive + t
  if (t.startsWith('/')) {
    return normalizeWinPath((driveOf(cwd) || driveOf(home) || '/C:') + t);
  }
  // Relativa al cwd (o al home si el cwd no es Windows)
  return normalizeWinPath((cwd || home) + '/' + t);
}
