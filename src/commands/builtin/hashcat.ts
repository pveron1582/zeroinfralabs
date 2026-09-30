// ── commands/builtin/hashcat.ts ───────────────────────────────────
// Simulador de crackeo de hashes
// NOTA: Estos son hashes FICTICIOS para propósitos educativos únicamente
// Los hashes MD5 mostrados son de contraseñas de ejemplo como "hello"
// NUNCA uses hashes reales en este simulador

import type { CommandContext, CommandResponse } from '../../types';
import { findFile, findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { canCreateInDir, canEditFile } from '../../utils/permissions';
import { getCurrentUser } from '../../utils/users';
import { applyUmask } from '../../utils/fs';

function extractHash(content: string): string {
  const trimmed = content.trim();
  // Si el archivo contiene "hash:..." o "user:hash", extraer el hash (32 hex MD5)
  const md5 = trimmed.match(/[a-fA-F0-9]{32}/);
  if (md5) return md5[0].toLowerCase();
  // fallback: primera línea
  return trimmed.split('\n')[0].trim().slice(0, 32);
}

// Todos los hashes MD5 del contenido (para filtrar --show por hashfile)
function extractHashes(content: string): string[] {
  const all = content.match(/[a-fA-F0-9]{32}/g);
  if (all) return [...new Set(all.map(h => h.toLowerCase()))];
  const first = content.trim().split('\n')[0]?.trim() ?? '';
  return first ? [first.slice(0, 32)] : [];
}

function potfilePath(home: string | undefined): string {
  const h = (home ?? '/root').replace(/\/$/, '') || '/root';
  return `${h}/.hashcat/hashcat.potfile`;
}

export const cmd_hashcat = {
  name: 'hashcat',
  execute: (args: string[], ctx?: CommandContext): CommandResponse => {
    const safeCtx = ctx ?? { machine: { id: 'test-01', machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '', os: 'Linux', status: 'up', type: 'server' }, discovery_level: 4, scan_results: { ports: [] }, web_enumeration: { web_server: 'none', cms: 'none', directories: [] }, learning_steps: [], files: [] } as unknown as CommandContext['machine'], allMachines: [], currentDir: '/' } as unknown as CommandContext;
    const hasShow = args.includes('--show');
    const aIdx = args.indexOf('-a');
    const mIdx = args.indexOf('-m');
    const oIdx = args.indexOf('-o');
    const outFile = oIdx !== -1 ? args[oIdx + 1] : null;

    // Filtrar flags conocidos para encontrar los posicionales (hashfile y wordlist)
    const filtered = args.filter((a, i) => {
      if (a === '-a' || a === '-m' || a === '-o') return false;
      if (i > 0 && (args[i - 1] === '-a' || args[i - 1] === '-m' || args[i - 1] === '-o')) return false;
      if (a === '--show' || a === '--username' || a.startsWith('--')) return false;
      if (a === '--username' && args[i + 1]) return false;
      return true;
    }).filter(a => !a.startsWith('-'));

    // Modo --show: lee el potfile real (~/.hashcat/hashcat.potfile).
    // Si se pasa un hashfile, filtra a esos hashes (como el hashcat real).
    if (hasShow) {
      const pot = findFile(safeCtx.machine, potfilePath(getCurrentUser(safeCtx.machine).home));
      const entries = (pot?.content ?? '').split('\n').map(s => s.trim()).filter(Boolean);
      let shown = entries;
      const showFilter = filtered[0];
      if (showFilter) {
        const showFile = findFile(safeCtx.machine, showFilter)
          ?? safeCtx.machine.files?.find(f => f.path.endsWith('/' + showFilter) || f.path === showFilter);
        const wanted = showFile?.content ? extractHashes(showFile.content) : [];
        if (wanted.length > 0) shown = entries.filter(e => wanted.some(h => e.toLowerCase().startsWith(h)));
      }
      if (shown.length === 0) {
        return { output: 'No hay hashes crackeados en el potfile para mostrar.\nCrackea primero con: hashcat -m 0 hash.txt rockyou.txt' };
      }
      return { output: shown.join('\n') + '\n' };
    }

    if (mIdx === -1) return { output: 'Uso: hashcat -m 0 [-a 0] hash.txt rockyou.txt [--show] [-o cracked.txt]', isError: true };
    const mode = args[mIdx + 1];
    if (!mode || isNaN(Number(mode)))
      return { output: `Error: modo inválido "${mode}". Ejemplo: -m 0`, isError: true };
    if (aIdx !== -1) {
      const aVal = args[aIdx + 1];
      if (aVal && !['0', '3', '6', '7'].includes(aVal)) {
        return { output: `Error: modo de ataque -a "${aVal}" no soportado. Usa -a 0 (dictionary)`, isError: true };
      }
    }

    const hf = filtered[0];
    const wf = filtered[1];
    if (!hf || !wf) return { output: 'Uso: hashcat -m 0 [-a 0] hash.txt rockyou.txt [--show] [-o cracked.txt]', isError: true };
    if (!wf.includes('rockyou')) return { output: `Error: wordlist "${wf}" no soportada. Usa rockyou.txt`, isError: true };

    // Intentar leer el archivo de hashes del FS virtual
    let hashContent = '5d41402abc4b2a76b9719d911017c592';
    let hashSource = hf;
    const hashFileEntry = findFile(safeCtx.machine, hf) ?? safeCtx.machine.files?.find(f => f.path.endsWith('/' + hf) || f.path === hf);
    if (hashFileEntry?.content) {
      hashContent = extractHash(hashFileEntry.content);
      hashSource = hashFileEntry.path;
    } else if (safeCtx.machine.files?.some(f => f.path.includes(hf))) {
      const found = safeCtx.machine.files.find(f => f.path.includes(hf));
      if (found?.content) hashContent = extractHash(found.content);
    }

    const demoHash = hashContent.length === 32 ? hashContent : '5d41402abc4b2a76b9719d911017c592';
    const cracked = 'hello';

    // Simular escritura a archivo -o
    let filesChanged: typeof safeCtx.machine.files | undefined = undefined;
    if (outFile) {
      const user = getCurrentUser(safeCtx.machine);
      const parent = findParentDir(safeCtx.machine, outFile.startsWith('/') ? outFile : (safeCtx.currentDir || '/') + '/' + outFile);
      if (parent && canCreateInDir(safeCtx.machine, parent, user)) {
        const fullPath = outFile.startsWith('/') ? outFile : (safeCtx.currentDir?.replace(/\/$/, '') || '') + '/' + outFile;
        const existing = findFile(safeCtx.machine, fullPath);
        if (existing && !canEditFile(safeCtx.machine, existing, user)) {
          // no escribir si no hay permiso, pero el crack sigue
        } else {
          const ownership: { owner: string; group: string; mode: number } = existing?.owner
            ? { owner: existing.owner!, group: existing.group!, mode: existing.mode! }
            : defaultOwnership(safeCtx.machine, user, applyUmask(0o644, safeCtx.umask ?? 0o022));
          const content = `${demoHash}:${cracked}\n`;
          const entry = buildNewFile(fullPath, content, 'text', ownership);
          filesChanged = [...safeCtx.machine.files.filter(f => f.path !== fullPath), entry];
        }
      }
    }

    // ── Potfile: el hashcat real persiste cracks en ~/.hashcat/hashcat.potfile ──
    // Así `--show` muestra lo realmente crackeado en esta máquina.
    {
      const user = getCurrentUser(safeCtx.machine);
      const home = (user.home ?? '/root').replace(/\/$/, '') || '/root';
      const potPath = `${home}/.hashcat/hashcat.potfile`;
      const dirMarker = `${home}/.hashcat/.dir`;
      const base = filesChanged ?? [...safeCtx.machine.files];
      const homeEntry = findFile(safeCtx.machine, `${home}/.dir`);
      if (homeEntry && canCreateInDir(safeCtx.machine, homeEntry, user)) {
        if (!base.some(f => f.path === dirMarker)) {
          base.push(buildNewFile(dirMarker, '', 'text', defaultOwnership(safeCtx.machine, user, applyUmask(0o755, safeCtx.umask ?? 0o022))));
        }
        const potLine = `${demoHash}:${cracked}\n`;
        const potIdx = base.findIndex(f => f.path === potPath);
        if (potIdx === -1) {
          base.push(buildNewFile(potPath, potLine, 'text', defaultOwnership(safeCtx.machine, user, applyUmask(0o644, safeCtx.umask ?? 0o022))));
        } else if (!base[potIdx].content?.includes(potLine.trim())) {
          base[potIdx] = { ...base[potIdx], content: (base[potIdx].content ?? '') + potLine };
        }
        filesChanged = base;
      }
    }

    const out = `hashcat (v6.2.5) starting...\n* Device #1: Intel Core i7 [12.5 MH/s]\n* Device #2: NVIDIA RTX 3080 [450 MH/s]\n\n[+] Hash.Target: ${hashSource}\n[+] Mode: ${mode} (${aIdx !== -1 ? `attack ${args[aIdx + 1]}` : 'dictionary'})\n[+] Status: Cracked\n\n${demoHash}:${cracked}\n\nSession: Cracked ✓\n\n⚠️  NOTA: Este es un simulador educativo. Los hashes mostrados son ficticios.`;
    return {
      output: out,
      filesChanged,
      streamingLineDelays: out.split('\n').map((line, idx) => {
        if (line.startsWith('* Device')) return 150 + Math.random() * 100;
        if (line.startsWith('[+]')) return 100 + Math.random() * 80;
        if (line.includes('⚠️')) return 200 + Math.random() * 150;
        if (idx === 0) return 120 + Math.random() * 80;
        return 60 + Math.random() * 60;
      }),
    };
  }
};
