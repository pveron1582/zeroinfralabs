// ── components/WindowsDesktop/apps/Explorer.tsx ──────────────────
// Explorador de archivos sobre el FS virtual de la máquina Windows.

import { useMemo, useState } from 'react';
import type { FileEntry, Machine, User } from '../../../types';
import { getCurrentUser } from '../../../utils/users';
import { canRead, canExecute } from '../../../utils/permissions';
import { findDirEntry } from '../../../utils/fs';
import { winDisplay, normalizeWinPath } from '../../../utils/winPath';

interface Props {
  machine: Machine;
}

interface Entry {
  name: string;
  isDir: boolean;
  path: string;
  size: number;
}

function listDir(machine: Machine, canonical: string, user: User): Entry[] {
  const dirEntry = findDirEntry(machine, canonical);
  if (!dirEntry || !canExecute(machine, dirEntry, user)) return [];

  const prefix = canonical === '/' ? '/' : canonical + '/';
  const map = new Map<string, Entry>();

  for (const f of machine.files || []) {
    if (f.path.endsWith('/.dir')) {
      const dirPath = f.path.slice(0, -'/.dir'.length);
      if (dirPath === canonical) continue;
      const parent = dirPath.slice(0, dirPath.lastIndexOf('/')) || '/';
      if (parent === canonical) {
        const name = dirPath.slice(dirPath.lastIndexOf('/') + 1);
        if (name) {
          map.set(name, { name, isDir: true, path: dirPath, size: 0 });
        }
      }
      continue;
    }
    if (!f.path.startsWith(prefix)) continue;
    const rel = f.path.slice(prefix.length);
    if (!rel || rel.includes('/')) continue;
    if (!canRead(machine, f, user)) continue;
    map.set(rel, {
      name: rel,
      isDir: false,
      path: f.path,
      size: (f.content || '').length,
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function parentOf(canonical: string): string | null {
  if (canonical === '/' || !canonical) return null;
  // Raíz de unidad Windows (/C:) no tiene padre visible.
  if (/^\/[A-Za-z]:$/.test(canonical)) return null;
  const idx = canonical.lastIndexOf('/');
  if (idx <= 0) return '/';
  return canonical.slice(0, idx);
}

export function Explorer({ machine }: Props) {
  const user = useMemo(() => getCurrentUser(machine), [machine]);
  const home = user.home && user.home.startsWith('/') ? user.home : '/C:/Users/user';
  const [cwd, setCwd] = useState(() => normalizeWinPath(home));
  const [preview, setPreview] = useState<FileEntry | null>(null);

  const entries = useMemo(() => listDir(machine, cwd, user), [machine, cwd, user]);
  const parent = parentOf(cwd);

  const openEntry = (e: Entry) => {
    if (e.isDir) {
      setPreview(null);
      setCwd(e.path);
      return;
    }
    const file = machine.files.find(f => f.path === e.path) ?? null;
    if (file && canRead(machine, file, user)) setPreview(file);
  };

  return (
    <div className="flex h-full text-sm" data-testid="win-explorer">
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-700">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-700 bg-slate-900">
          <button
            type="button"
            disabled={!parent}
            onClick={() => {
              if (parent) {
                setPreview(null);
                setCwd(parent);
              }
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            aria-label="Subir un nivel"
          >
            ↑
          </button>
          <div className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-xs text-slate-300 truncate">
            {winDisplay(cwd)}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-900" data-testid="explorer-list">
          {entries.length === 0 && (
            <p className="p-4 text-slate-400 text-xs">Carpeta vacía o sin permisos.</p>
          )}
          {entries.map(e => (
            <button
              key={e.path}
              type="button"
              onClick={() => openEntry(e)}
              onDoubleClick={() => openEntry(e)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-blue-600/30 text-slate-200"
              data-testid={`explorer-entry-${e.name}`}
            >
              <span className="text-amber-400 w-4">{e.isDir ? '📁' : '📄'}</span>
              <span className="truncate flex-1">{e.name}</span>
              {!e.isDir && (
                <span className="text-slate-400 text-xs tabular-nums">{e.size}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {preview && (
        <div className="w-[45%] flex flex-col min-w-0 bg-slate-950">
          <div className="px-2 py-1.5 border-b border-slate-700 text-xs text-slate-400 truncate">
            {winDisplay(preview.path)}
          </div>
          <pre className="flex-1 overflow-auto p-3 text-xs text-emerald-300 font-mono whitespace-pre-wrap">
            {preview.content}
          </pre>
        </div>
      )}
    </div>
  );
}
