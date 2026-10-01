// ── commands/tools/wget.ts ─────────────────────────────────────────
// wget (Tier 1): descarga del servidor virtual (web_enumeration) a un
// archivo local con permisos reales. Soporta -O (output) y -q.

import type { CommandContext, CommandResponse } from '../../types';
import { parseUrl, getVulnerablePage } from '../../frameworks/http';
import { upsertFiles } from '../../utils/filesChanged';
import { createNmapFileWriter } from './nmap/outfiles';

const WGET_HELP = `Usage: wget [OPTION] URL
The non-interactive network downloader.

  -O FILE   Write output to FILENAME
  -q        Quiet mode
  -r        Recursive (simulado: solo la página pedida)

Examples:
  wget http://10.10.10.11/
  wget -O index.html http://10.10.10.11/
  wget -q http://metasploitable/target`;

export const cmd_wget = {
  name: 'wget',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: WGET_HELP };
    let outFile: string | null = null;
    let quiet = false;
    let url: string | null = null;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-O') { outFile = args[++i] ?? null; }
      else if (a.startsWith('-O') && a.length > 2) { outFile = a.slice(2); }
      else if (a === '-q' || a === '--quiet') { quiet = true; }
      else if (a.startsWith('-')) continue; // r/nv/nc/etc: simulador toma solo la página pedida
      else if (!url && (a.startsWith('http://') || a.startsWith('https://'))) url = a;
    }
    if (!url) return { output: 'wget: missing URL\nUsage: wget [OPTION] URL', isError: true };

    const parsed = parseUrl(url);
    if (!parsed) return { output: `wget: unable to resolve host address ‘${url.split('/')[2] ?? url}’`, isError: true };

    const target = ctx.allMachines.find(m => m.machine_info.ip === parsed.host || m.machine_info.hostname === parsed.host);
    if (!target) {
      if (!quiet) {
        return { output: `--${new Date().toISOString().slice(0, 19)}--  ${url}\nResolving ${parsed.host} (${parsed.host})... failed: Name or service not known.\nwget: unable to resolve host address ‘${parsed.host}’`, isError: true };
      }
      return { output: '', isError: true };
    }
    if (!target.web_enumeration || !target.web_enumeration.web_server || target.web_enumeration.web_server === 'none') {
      if (!quiet) {
        return { output: `--${new Date().toISOString().slice(0, 19)}--  ${url}\nConnecting to ${parsed.host}:${parsed.port}... failed: Connection refused.`, isError: true };
      }
      return { output: '', isError: true };
    }

    const body = getVulnerablePage(target, parsed.path || '/') ?? '';
    const fname = outFile ?? (parsed.path && parsed.path !== '/' ? parsed.path.split('/').pop() || 'index.html' : 'index.html');
    const writer = createNmapFileWriter(ctx, ctx.currentDir || '/root');
    writer.tryAddCreatedFile(fname, body);
    const head = quiet ? '' : `--${new Date().toISOString().slice(0, 19)}--  ${url}\nResolving ${parsed.host} (${parsed.host})... ${target.machine_info.ip}\nConnecting to ${parsed.host}:${parsed.port}... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: ${body.length} [text/html]\nSaving to: '‘${fname}’'\n\n${fname.padEnd(20)}    100%[===================>]  ${(body.length / 1024).toFixed(2)}K    ${(body.length / 1024 / 0.03).toFixed(2)}K/s    in 0.03s\n\n${new Date().toISOString().slice(0, 19)} (12.3 MB/s) - ‘${fname}’ saved [${body.length}]\n`;
    const resp: CommandResponse = { output: head.trimEnd(), isError: false };
    if (writer.createdFiles.length > 0) {
      // `filesChanged` es el snapshot COMPLETO (el store reemplaza
      // machine.files entero): mandar sólo los creados borraba el resto del
      // FS del equipo. Se mergean por path y se devuelve el árbol entero.
      ctx.machine.files = upsertFiles(ctx.machine.files, writer.createdFiles);
      resp.filesChanged = [...ctx.machine.files];
      resp.downloadedFile = writer.createdFiles[writer.createdFiles.length - 1];
    }
    if (writer.createdFileErrors.length > 0) {
      resp.isError = true;
      resp.output = (resp.output ? resp.output + '\n' : '') + writer.createdFileErrors.join('\n');
    }
    return resp;
  },
};
