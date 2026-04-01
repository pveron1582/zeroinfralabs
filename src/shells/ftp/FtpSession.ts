// ── shells/ftp/FtpSession.ts ──────────────────────────────────────

import type { ShellSession, ShellContext, ShellResult } from '../ShellSession';
import { useScenarioStore } from '../../store/scenarioStore';

// ── Estado del shell FTP ──────────────────────────────────────────
export interface FtpState {
  connected: boolean;
  targetIp?: string;
  targetId?: string;
  username?: string;
  password?: string;
  loggedIn: boolean;
  step: 'connecting' | 'username' | 'password' | 'connected';
}

// ── Implementación del shell FTP ──────────────────────────────────
export const ftpSession: ShellSession<FtpState> = {
  name: 'ftp',

  // ── Prompt dinámico ────────────────────────────────────────────
  getPrompt(state: FtpState): string {
    if (state.step === 'username') {
      return `Name (${state.targetIp || 'localhost'}:${state.username || 'root'}): `;
    }
    if (state.step === 'password') {
      return 'Password: ';
    }
    return 'ftp> ';
  },

  // ── Estado inicial ─────────────────────────────────────────────
  createInitialState(args: string[], ctx: ShellContext): FtpState {
    if (args[0]) {
      const targetIp = args[0];
      const target = ctx.allMachines.find(m => m.machine_info.ip === targetIp);

      if (!target) {
        return { connected: false, loggedIn: false, step: 'connecting' };
      }

      const ftpPort = target.scan_results.ports.find(
        p => p.service === 'ftp' && p.state === 'open'
      );

      if (!ftpPort) {
        return { connected: false, loggedIn: false, step: 'connecting' };
      }

      return {
        connected: true,
        targetIp,
        targetId: target.id,
        loggedIn: false,
        step: 'username',
      };
    }

    return { connected: false, loggedIn: false, step: 'connecting' };
  },

  // ── Lógica principal ───────────────────────────────────────────
  executeCommand(
    input: string,
    state: FtpState,
    ctx: ShellContext
  ): { result: ShellResult; newState: FtpState } {

    const trimmedInput = input.trim();
    const parts = trimmedInput.split(/\s+/);
    const cmd = parts[0]?.toLowerCase() || '';

    // ── 1. Conexión inicial (ftp <ip>) ─────────────────────────────
    if (!state.connected) {
      if (!trimmedInput) {
        return {
          result: { output: `uso: ftp <hostname-or-ip>`, isError: true },
          newState: state,
        };
      }

      const targetIp = parts[0];
      const target = ctx.allMachines.find(m => m.machine_info.ip === targetIp);

      if (!target) {
        return {
          result: { output: `ftp: connect: Connection refused`, isError: true },
          newState: state,
        };
      }

      const ftpPort = target.scan_results.ports.find(
        p => p.service === 'ftp' && p.state === 'open'
      );

      if (!ftpPort) {
        return {
          result: { output: `ftp: connect: Connection refused`, isError: true },
          newState: state,
        };
      }

      return {
        result: {
          output: `Connected to ${targetIp}.\n220 (vsFTPd 3.0.3)\nName (${targetIp}:anonymous): `,
        },
        newState: {
          connected: true,
          targetIp,
          targetId: target.id,
          loggedIn: false,
          step: 'username',
        },
      };
    }

    // ── 2. Username ───────────────────────────────────────────────
    if (state.step === 'username') {
      // Guardar el username y pasar al paso de password (igual para anonymous u otro)
      return {
        result: {
          output: `331 Please specify the password.`,
        },
        newState: {
          ...state,
          username: trimmedInput,
          step: 'password',
        },
      };
    }

    // ── 3. Password ──────────────────────────────────────────────
    if (state.step === 'password') {
      // Acepta cualquier contraseña (incluyendo vacía, solo presionar Enter)
      // Si el usuario es anonymous, se permite cualquier password (incluyendo vacía)
      const isAnonymous = state.username?.toLowerCase() === 'anonymous';
      
      return {
        result: {
          output: `230 Login successful.\nRemote system type is UNIX.\nUsing binary mode to transfer files.`,
          completedMissionId: 3,
        },
        newState: {
          ...state,
          loggedIn: true,
          step: 'connected',
          password: trimmedInput, // Guardar la contraseña ingresada (puede ser vacía)
        },
      };
    }

    // ── 4. Comandos FTP ───────────────────────────────────────────
    if (state.loggedIn && state.connected) {
      const target = ctx.allMachines.find(m => m.id === state.targetId);

      if (!target) {
        return {
          result: { output: `Connection lost.`, isError: true, closeSession: true },
          newState: state,
        };
      }

      switch (cmd) {
        case 'ls':
        case 'dir': {
          const ftpFiles = target.files?.filter(f =>
            f.path.startsWith('/srv/ftp/')
          ) || [];

          if (ftpFiles.length === 0) {
            return { result: { output: '' }, newState: state };
          }

          // Obtener el idioma del store directamente
          const storeLang = useScenarioStore.getState().language;
          const lang = storeLang || ctx.language || 'es';
          
          // Filtrar archivos según el idioma - solo mostrar nota.txt o note.txt
          const filteredFiles = ftpFiles.filter(f => {
            const filename = f.path.replace('/srv/ftp/', '');
            // Si es español, mostrar nota.txt; si es inglés, mostrar note.txt
            if (lang === 'es') return filename === 'nota.txt';
            return filename === 'note.txt';
          });

          const filesToShow = filteredFiles.length > 0 ? filteredFiles : ftpFiles;

          const fileList = filesToShow.map(f => {
            const filename = f.path.replace('/srv/ftp/', '');
            return `-rw-r--r-- 1 ftp ftp ${f.content.length} Jan 01 00:00 ${filename}`;
          }).join('\n');

          return { result: { output: fileList }, newState: state };
        }

        case 'get': {
          const filename = parts[1];

          if (!filename) {
            return {
              result: { output: `usage: get remote-file [local-file]` },
              newState: state,
            };
          }

          const targetFile = target.files?.find(
            f => f.path === `/srv/ftp/${filename}`
          );

          if (!targetFile) {
            return {
              result: { output: `local: ${filename}: No such file or directory` },
              newState: state,
            };
          }

          const downloadPath = `/root/${filename}`;

          return {
            result: {
              output:
                `local: ${filename} remote: ${filename}\n` +
                `200 PORT command successful.\n` +
                `150 Opening BINARY mode data connection for ${filename} (${targetFile.content.length} bytes).\n` +
                `226 Transfer complete.`,
              completedMissionId: 4,
              downloadedFile: {
                path: downloadPath,
                content: targetFile.content,
                type: targetFile.type,
              },
            },
            newState: state,
          };
        }

        case 'help':
        case '?':
          return {
            result: {
              output:
                `Commands available:\n` +
                `  ls, dir       List files\n` +
                `  get           Download file\n` +
                `  help, ?       Show help\n` +
                `  quit, bye    Exit FTP`,
            },
            newState: state,
          };

        case 'bye':
        case 'quit':
          return {
            result: { output: `221 Goodbye.`, closeSession: true },
            newState: { ...state, connected: false, loggedIn: false },
          };

        case 'exit':
          return {
            result: { output: `221 Goodbye.`, closeSession: true },
            newState: { ...state, connected: false, loggedIn: false },
          };

        default:
          if (cmd) {
            return {
              result: { output: `?Invalid command` },
              newState: state,
            };
          }

          return { result: { output: '' }, newState: state };
      }
    }

    // ── Fallback ──────────────────────────────────────────────────
    return {
      result: { output: `?Invalid command or not logged in`, isError: true },
      newState: state,
    };
  },

  // ── Mantener sesión activa ─────────────────────────────────────
  isActive(state: FtpState): boolean {
    return state.connected;
  },
};