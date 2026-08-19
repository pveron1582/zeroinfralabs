// ── fs-models/fs-linux.ts ─────────────────────────────────────────
// Modelo de sistema de archivos Linux para laboratorios
// Estructura base de un sistema Linux, template para diferentes escenarios.
// Subárboles extraídos en módulos: fs-etc, fs-var, fs-wordlists.

import type { FileEntry } from '../types';
import { buildIdentityFiles, ETC_STATIC_FILES } from './fs-etc';
import { VAR_FILES } from './fs-var';
import { WORDLIST_FILES } from './fs-wordlists';
import type { ExtraLinuxUser, LinuxFileSystemConfig } from './fs-linux-types';

export type { ExtraLinuxUser, LinuxFileSystemConfig };

// ═══════════════════════════════════════════════════════════════
// ESTRUCTURA DE DIRECTORIOS RAÍZ (directorios vacíos para ls)
// ═══════════════════════════════════════════════════════════════
const ROOT_DIRS: FileEntry[] = [
  { path: '/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/boot/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/dev/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/lib/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/lib64/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/media/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/mnt/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/opt/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/proc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
  { path: '/run/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/sbin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/srv/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/sys/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
  { path: '/usr/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/var/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
];

// ═══════════════════════════════════════════════════════════════
// /root/ - Directorio del superusuario
// ═══════════════════════════════════════════════════════════════
// Nota: /root/flag.txt se agrega desde el archivo del escenario específico de la víctima
const ROOT_HOME_FILES: FileEntry[] = [
  { path: '/root/.bashrc', content: '# ~/.bashrc: executed by bash(1) for non-login shells.\n\n# If not running interactively, don\'t do anything\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\nHISTCONTROL=ignoreboth\nshopt -s histappend\nHISTSIZE=1000\nHISTFILESIZE=2000\nshopt -s checkwinsize\n\n# Alias definitions\nalias ll=\'ls -l\'\nalias la=\'ls -la\'\nalias l=\'ls -CF\'\n\n# Root specific\nexport PATH="/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\nexport EDITOR=nano', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
  { path: '/root/.profile', content: '# ~/.profile: executed by the command interpreter for login shells.\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n\t. "$HOME/.bashrc"\n    fi\nfi\n\nif [ -d "$HOME/bin" ] ; then\n    PATH="$HOME/bin:$PATH"\nfi', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
];

// ═══════════════════════════════════════════════════════════════
// /usr/ - Programas y datos de usuario (incluyendo binarios SUID)
// ═══════════════════════════════════════════════════════════════
const USR_FILES: FileEntry[] = [
  { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/usr/bin/su', content: '[ELF binary - su]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
  { path: '/usr/bin/sudo', content: '[ELF binary - sudo]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
  { path: '/usr/bin/passwd', content: '[ELF binary - passwd]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
  { path: '/usr/bin/find', content: '[ELF binary - find]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
  { path: '/usr/bin/vim', content: '[ELF binary - vim]', type: 'binary', owner: 'root', group: 'root', mode: 0o4755 },
  { path: '/usr/sbin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/usr/lib/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/usr/local/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
  { path: '/usr/share/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
];

export function createLinuxFileSystem(config: LinuxFileSystemConfig = {}): FileEntry[] {
  const u = config.username || 'www-data';
  const sp = config.shadowPassword || '$6$rounds=656000$abcdefghijklmnop$1234567890abcdefghijklmnop/1234567890123456';
  const extraUsers = config.extraUsers ?? [];
  const extraUsersBlock = (fn: (eu: ExtraLinuxUser, i: number) => string) =>
    extraUsers.length ? '\n' + extraUsers.map(fn).join('\n') : '';

  return [
    ...ROOT_DIRS,
    ...buildIdentityFiles(u, sp, extraUsersBlock),
    ...ETC_STATIC_FILES,
    ...VAR_FILES,
    ...ROOT_HOME_FILES,
    ...USR_FILES,
    ...WORDLIST_FILES,
    // Secciones /tmp y /opt: duplicados intencionales del árbol raíz
    // (preservados por equivalencia con la estructura original)
    { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
    { path: '/opt/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    // /home/ - Homes de los usuarios extra (definidos en extraUsers)
    ...extraUsers.map((eu) => ({
      path: `/home/${eu.username}/.dir`,
      content: '',
      type: 'text' as const,
      owner: eu.username,
      group: eu.username,
      mode: 0o755,
    })),
  ];
}
