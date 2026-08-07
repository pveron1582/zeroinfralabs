// ── utils/path.ts ──────────────────────────────────────────────────
// Utilidades compartidas de normalización de rutas

export const SYSTEM_DIRS = [
  '/bin', '/boot', '/dev', '/etc', '/lib', '/lib64',
  '/proc', '/root', '/sbin', '/srv', '/sys', '/usr', '/var'
];

export function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const normalized: string[] = [];
  for (const part of parts) {
    if (part === '..') {
      normalized.pop();
    } else if (part !== '.') {
      normalized.push(part);
    }
  }
  const result = normalized.length === 0 ? '/' : '/' + normalized.join('/');
  return result.endsWith('/') ? result : result + '/';
}

export function ensureTrailingSlash(path: string): string {
  if (!path) return '/';
  return path.endsWith('/') ? path : path + '/';
}

export function resolvePath(target: string, currentDir: string, homeDir: string): string {
  if (target === '/' || target === '') return '/';
  if (target.startsWith('/')) return ensureTrailingSlash(target);
  if (target.startsWith('~')) {
    const suffix = target.length > 1 ? target.slice(1) : '';
    return ensureTrailingSlash(homeDir + suffix.replace(/^\//, ''));
  }
  const base = ensureTrailingSlash(currentDir);
  return normalizePath(base + target);
}
