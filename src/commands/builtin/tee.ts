// ── commands/builtin/tee.ts ───────────────────────────────────────
// Lee stdin y lo escribe a archivos + stdout (Tier 1). -a agrega.
// Permisos vía writeOutputToFile (respeta owner/grupo/modo).

import type { CommandContext, CommandResponse } from '../../types';
import { writeOutputToFile } from '../../utils/redirection';

const TEE_HELP = `Usage: tee [OPTION] [FILE...]
Copy standard input to files and standard output.

Options:
  -a  Append instead of overwriting

Examples:
  echo hello | tee out.txt
  cat log | tee -a a.txt b.txt`;

export const cmd_tee = {
  name: 'tee',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let append = false;
    const files: string[] = [];
    for (const a of args) {
      if (a === '-h' || a === '--help') return { output: TEE_HELP };
      else if (a === '-a' || a === '--append') { append = true; }
      else if (a.startsWith('-')) { return { output: `tee: invalid option -- '${a.replace(/^-+/, '')[0] ?? ''}'`, isError: true }; }
      else files.push(a);
    }

    const data = ctx.pipedInput ?? '';
    const errs: string[] = [];
    for (const f of files) {
      const write = writeOutputToFile(
        ctx.machine,
        ctx.currentDir,
        ctx.umask ?? 0o022,
        f,
        data === '' ? '' : data + '\n',
        append ? '>>' : '>'
      );
      if (!write.ok) errs.push(`tee: ${f}: ${write.error.split(': ').slice(-1)[0]}`);
    }
    // filesChanged sale del estado mutado (writeOutputToFile actualiza
    // machine.files en cada escritura exitosa).
    const changed = files.length > 0 && errs.length < files.length ? [...ctx.machine.files] : undefined;
    if (errs.length > 0) {
      const body = data === '' ? '' : data + '\n';
      return {
        output: (body + errs.join('\n')).replace(/\n$/, ''),
        isError: true,
        ...(changed ? { filesChanged: changed } : {}),
      };
    }
    return { output: data, ...(changed ? { filesChanged: changed } : {}) };
  },
};
