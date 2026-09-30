// ── commands/windows/winpeas.ts ────────────────────────────────────
// winPEAS: enumeración de privilegios en Windows (PLAN_WINDOWS W4).
// Desacoplado de labs: escanea el FS legible en busca de credenciales
// y emite foundCredentials/fileRead como metadata. El LabValidator
// decide si eso completa una misión.

import type { CommandContext, CommandResponse, FoundCredentialsData } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { canRead } from '../../utils/permissions';
import { getAllServices } from '../../frameworks/process/processManager';
import { buildFileReadMetadata } from '../../utils/fileRead';
import { winDisplay } from '../../utils/winPath';
import { winUser } from '../../utils/winCmd';

const CRED_USER_RE = /username\s*[:=]\s*([^\s]+)/i;
const CRED_PASS_RE = /password\s*[:=]\s*([^\s]+)/i;

interface Finding {
  file: string;
  user: string;
  pass: string;
}

function scanForCredentials(ctx: CommandContext): Finding[] {
  const user = winUser(ctx);
  const findings: Finding[] = [];
  for (const f of ctx.machine.files || []) {
    if (f.path.endsWith('/.dir')) continue;
    if (!canRead(ctx.machine, f, user)) continue;
    const u = f.content.match(CRED_USER_RE);
    const p = f.content.match(CRED_PASS_RE);
    if (u && p) findings.push({ file: f.path, user: u[1], pass: p[1] });
  }
  return findings;
}

export const cmd_winpeas = {
  name: 'winpeas',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    const user = getCurrentUser(ctx.machine);
    const host = ctx.machine.win?.computerName || ctx.machine.machine_info.hostname;
    const findings = scanForCredentials(ctx);

    const lines: string[] = [
      '  winPEAS — Windows Privilege Escalation Awesome Scripts',
      '',
      `[*] Equipo:        ${host}`,
      `[*] SO:            ${ctx.machine.machine_info.os}`,
      `[*] Usuario:       ${user.username} (uid=${user.uid})`,
      `[*] Admin:         ${user.uid === 0 ? 'Sí' : 'No'}`,
      '',
      '══ Servicios ═══════════════════════════════════════',
    ];

    for (const s of getAllServices(ctx.machine)) {
      lines.push(`  [${s.running ? '*' : ' '}] ${s.name.padEnd(20)} ${s.description}`);
    }

    lines.push('');
    lines.push('══ Credenciales encontradas ═══════════════════════');

    let foundCredentials: FoundCredentialsData | undefined;
    let firstMeta: ReturnType<typeof buildFileReadMetadata> | null = null;

    if (findings.length === 0) {
      lines.push('  [-] No se detectaron credenciales legibles.');
    } else {
      for (const f of findings) {
        // Ruta estilo Windows (copy-pasteable con `type`); en la metadata
        // se conserva la forma canónica /C:/... que usa el FS interno.
        lines.push(`  [+] ${winDisplay(f.file)}`);
        lines.push(`      Username: ${f.user}`);
        lines.push(`      Password: ${f.pass}`);
        if (!foundCredentials) {
          foundCredentials = {
            machineId: ctx.machine.id,
            user: f.user,
            pass: f.pass,
            file: f.file,
          };
        }
        if (!firstMeta) {
          const entry = ctx.machine.files.find(x => x.path === f.file);
          if (entry) firstMeta = buildFileReadMetadata(ctx.machine, ctx.allMachines, entry);
        }
      }
    }

    lines.push('');
    lines.push(`[*] Fin de winPEAS (${findings.length} hallazgo(s)).`);

    return {
      output: lines.join('\n'),
      ...(foundCredentials && { foundCredentials }),
      ...(firstMeta && {
        type: 'fileRead' as const,
        fileRead: firstMeta.fileRead,
        ...(firstMeta.possibleUsers && { possibleUsers: firstMeta.possibleUsers }),
      }),
    };
  },
};
